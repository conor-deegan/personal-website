import { BlogPosts } from 'app/components/posts';

export const metadata = {
    title: 'Notes',
    description: 'Thoughts made into words.',
};

export default function Page() {
    return (
        <section>
            <BlogPosts />
        </section>
    );
}
