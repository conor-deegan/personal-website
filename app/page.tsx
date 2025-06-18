import { BlogPosts } from './components/posts';

export default function Page() {
    return (
        <section>
            <p className="mb-4">
        I&apos;m a computer scientist and software engineer. Mostly interested
        in applied cryptography. I&apos;m currently co-founder and VP of engineering at{' '}
                <a
                    href="https://www.projecteleven.com"
                    className="text-blue-500 hover:underline"
                >
          Project Eleven
                </a>
        .
            </p>
            <div className="my-8">
                <h3 className="text-xl font-bold mb-4">notes</h3>
                <BlogPosts />
            </div>
            <p>My PGP is <a href="/pgp.txt" className="text-blue-500 hover:underline break-words"><code>9EC530B5788C0870</code></a></p>
        </section>
    );
}
