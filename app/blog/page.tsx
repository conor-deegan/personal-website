import { BlogPosts } from './../components/posts';

export const metadata = {
    title: 'Writing',
    description: 'Writing about things I find interesting.',
};

export default function Page() {
    return (
        <section>
            <BlogPosts />
        </section>
    );
}
