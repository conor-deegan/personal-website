import { BlogPosts } from './components/posts';

export default function Page() {
    return (
        <section>
            <p className="mb-4">
        I&apos;m a Software Engineer. Mostly interested in Cryptography &
        Quantum Cryptanalysis. I&apos;m currently head of engineering at{' '}
                <a href="https://www.projecteleven.com">Project Eleven</a>.
            </p>
            <div className="my-8">
                <BlogPosts />
            </div>
        </section>
    );
}
