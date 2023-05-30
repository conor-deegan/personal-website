import { Box } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

import { getFiles, getPostBySlug } from '../../lib/post';

export default function Post({
    frontMatter,
    markdownBody
}: {
    frontMatter: {
        [key: string]: any;
    };
    markdownBody: string;
}) {
    if (!frontMatter) return <></>;

    return (
        <Box color={'brand.lightPrimary'}>
            <ReactMarkdown children={markdownBody} />
        </Box>
    );
}

export async function getStaticProps({
    params
}: {
    params: { post: string };
}): Promise<{
    props: {
        frontMatter: {
            [key: string]: any;
        };
        markdownBody: string;
    };
}> {
    const { frontMatter, markdownBody } = await getPostBySlug(params.post);

    return {
        props: {
            frontMatter,
            markdownBody
        }
    };
}

export async function getStaticPaths() {
    const posts = await getFiles();
    const paths = posts.map((slug) => `/posts/${slug.replace('.md', '')}`);

    return {
        paths,
        fallback: false
    };
}
