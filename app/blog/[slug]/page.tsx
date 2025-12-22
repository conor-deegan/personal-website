import { formatDate, getBlogPosts } from './../utils';
import { baseUrl } from './../../sitemap';
import { CustomMDX } from './../../components/mdx';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const post = getBlogPosts().find((p) => p.slug === params.slug);

    if (!post) return;

    const { title, publishedAt: publishedTime, summary: description, image } = post.metadata;
    const ogImage = image ?? `${baseUrl}/og?title=${encodeURIComponent(title)}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime,
            url: `${baseUrl}/blog/${post.slug}`,
            images: [{ url: ogImage }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
    };
}

function getReadingTime(content: string): string {
    const words = content.split(/\s+/).length;
    return `${Math.ceil(words / 200)} min read`;
}

export default async function Blog(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const post = getBlogPosts().find((p) => p.slug === params.slug);

    if (!post) notFound();

    return (
        <article>
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BlogPosting',
                        headline: post.metadata.title,
                        datePublished: post.metadata.publishedAt,
                        dateModified: post.metadata.publishedAt,
                        description: post.metadata.summary,
                        image: post.metadata.image
                            ? `${baseUrl}${post.metadata.image}`
                            : `/og?title=${encodeURIComponent(post.metadata.title)}`,
                        url: `${baseUrl}/blog/${post.slug}`,
                        author: { '@type': 'Person', name: 'Conor Deegan' },
                    }),
                }}
            />

            <header className="mb-10">
                <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-4">
                    {post.metadata.title}
                </h1>
                <div className="flex items-center gap-3 text-muted text-sm font-sans">
                    <time dateTime={post.metadata.publishedAt}>
                        {formatDate(post.metadata.publishedAt, false)}
                    </time>
                    <span className="text-subtle">·</span>
                    <span>{getReadingTime(post.content)}</span>
                </div>
            </header>

            <div className="prose">
                <CustomMDX source={post.content} />
            </div>

            <footer className="mt-16">
                <Link href="/blog" className="nav-link text-sm">
                    ← All posts
                </Link>
            </footer>
        </article>
    );
}
