import { BlogPosts } from './components/posts';

export default function Page() {
    return (
        <section>
            <p className="mb-4">
                {`I'm a Software Engineer. Mostly interested in Cryptography,
                Platform Engineering, and AI. I hold an MSc in Distributed
                Systems and AI.`}
            </p>
            <div className="my-8">
                <BlogPosts />
            </div>
        </section>
    );
}
