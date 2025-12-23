import { BlogPosts } from './components/posts';
import { Subscribe } from './components/subscribe';

export default function Page() {
    return (
        <section>
            <div className="mb-12 space-y-4">
                <p>
                    I&apos;m a computer scientist and software engineer. Mostly interested in
                    applied cryptography. I&apos;m co-founder and CTO at{' '}
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

            <section>
                <Subscribe />
            </section>
        </section>
    );
}
