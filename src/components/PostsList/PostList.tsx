import { HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import Link from 'next/link';

import { IPostData } from './../../types';

export const PostList = ({ posts }: { posts: IPostData[] }) => {
    const link = useColorModeValue('brand.darkLink', 'brand.lightLink');
    return (
        <VStack align={'stretch'}>
            {posts.map(({ id, data }, i) => (
                <HStack key={i}>
                    <Text>{data.date}:</Text>
                    <Link href={`/posts/${id}`}>
                        <Text color={link}>{data.title}</Text>
                    </Link>
                </HStack>
            ))}
        </VStack>
    );
};
