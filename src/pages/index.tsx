import { Flex } from '@chakra-ui/react';

import { PostList } from '../components/PostsList';
import { getSortedPostsData } from '../lib/post';
import { IPostData } from '../types';

export default function Home({ allPostsData }: { allPostsData: IPostData[] }) {
    return (
        <Flex color={'brand.lightPrimary'}>
            <PostList allPostsData={allPostsData}></PostList>
        </Flex>
    );
}

export async function getStaticProps() {
    const allPostsData = getSortedPostsData();
    return {
        props: {
            allPostsData
        }
    };
}
