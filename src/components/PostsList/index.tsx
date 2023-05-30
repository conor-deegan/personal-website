import { Link } from '@chakra-ui/next-js';
import { Box, Text, VStack } from '@chakra-ui/react';

import { IPostData } from './../../types';

export const PostList = ({ allPostsData }: { allPostsData: IPostData[] }) => {
    return (
        <VStack>
            {allPostsData.map(({ id, data }, i) => (
                <Box key={i}>
                    <Link href={`/posts/${id}`}>
                        <Text>{data.title}</Text>
                    </Link>
                </Box>
            ))}
        </VStack>
    );
};
