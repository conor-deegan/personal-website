import { formatDate, getBlogPosts } from '../blog/utils';
import Link from 'next/link';

export function BlogPosts() {
    const allBlogs = getBlogPosts();

    return (
        <div className="space-y-6">
            {allBlogs
                .sort((a, b) => {
                    return new Date(b.metadata.publishedAt).getTime() -
                        new Date(a.metadata.publishedAt).getTime();
                })
                .map((post) => (
                    <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group block"
                    >
                        <article className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                            <time
                                dateTime={post.metadata.publishedAt}
                                className="text-muted text-sm font-sans tabular-nums shrink-0"
                            >
                                {formatDate(post.metadata.publishedAt, false)}
                            </time>
                            <h3 className="group-hover:text-[hsl(var(--accent))] transition-colors">
                                {post.metadata.title}
                            </h3>
                        </article>
                    </Link>
                ))}
        </div>
    );
}
