import { BlogPosts } from './components/posts';

export default function Page() {
    return (
        <section>
            <div className="mb-12 space-y-4">
                <p>
                    I&apos;m a computer scientist and software engineer. Mostly interested
                    in applied cryptography. I&apos;m co-founder and VP of engineering at{' '}
                    <a
                        href="https://www.projecteleven.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="content-link"
                    >
                        Project Eleven
                    </a>
                    .
                </p>
                <p>
                    At the moment, I write mostly over on{' '}
                    <a
                        href="https://blog.projecteleven.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="content-link"
                    >
                        the Project Eleven blog
                    </a>
                    .
                </p>
            </div>

            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-6 tracking-tight">Writing</h2>
                <BlogPosts />
            </section>

            <p className="text-sm text-muted">
                My PGP is{' '}
                <a href="/pgp.txt" className="content-link font-mono text-sm">
                    9EC530B5788C0870
                </a>
            </p>
        </section>
    );
}
