import {
    Box,
    Heading,
    Link,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import matter from 'gray-matter';

import { PostList } from '../components/PostsList/PostList';
import GenericPage from '../layouts/GenericPage/GenericPage';
import { IPostData } from '../types';

const Index = (props: {
    title: string;
    description: string;
    posts: IPostData[];
    twitterPostTitle: string;
    twitterPostDescription: string;
    twitterPostImage: string;
}) => {
    const link = useColorModeValue('brand.darkLink', 'brand.lightLink');
    return (
        <GenericPage
            title={props.title}
            description={props.description}
            twitterPostTitle={props.twitterPostTitle}
            twitterPostDescription={props.twitterPostDescription}
            twitterPostImage={props.twitterPostImage}
            showBack={false}
        >
            <Heading mt={4} mb={4} fontSize={'20px'}>
                About
            </Heading>
            <Box maxW={'30rem'} w={'100%'}>
                <Text ml={6}>
                    I'm a Software Engineer/Architect. I have 6+ years building
                    and growing startups. I have been a founder, CTO, Head of
                    Engineering, and Head of Product. I also have an MSc in
                    Computer Science where I focused on Distributed Systems and
                    AI. The purpose of this site is to document stuff that I
                    would normally keep in a private note/repo for reference.
                </Text>
            </Box>
            <Heading mt={4} mb={4} fontSize={'20px'}>
                Posts
            </Heading>
            <Box ml={6}>
                <PostList posts={props.posts} />
            </Box>
            <Heading mt={4} mb={4} fontSize={'20px'}>
                Contact
            </Heading>
            <VStack align={'left'} pl={6}>
                <Text>
                    Email:{' '}
                    <Link
                        href={'mailto:conorjdeegan@gmail.com'}
                        color={link}
                        target={'_blank'}
                    >
                        conorjdeegan@gmail.com
                    </Link>
                </Text>
                <Text>
                    Github:{' '}
                    <Link
                        href={'https://github.com/conor-deegan'}
                        color={link}
                        target={'_blank'}
                    >
                        Link
                    </Link>
                </Text>
                <Text>
                    Linkedin:{' '}
                    <Link
                        href={
                            'https://www.linkedin.com/in/conor-deegan-587513189/'
                        }
                        color={link}
                        target={'_blank'}
                    >
                        Link
                    </Link>
                </Text>
            </VStack>
            <Heading mt={4} mb={4} fontSize={'20px'}>
                Source Code
            </Heading>
            <VStack align={'left'} pl={6}>
                <Text>
                    Github:{' '}
                    <Link
                        href={
                            'https://github.com/conor-deegan/personal-website'
                        }
                        color={link}
                        target={'_blank'}
                    >
                        Link
                    </Link>
                </Text>
            </VStack>
        </GenericPage>
    );
};

export default Index;

export const getStaticProps = async () => {
    // getting the website config
    const config = await import('./../config/config.json');

    // get all posts
    const webpackContext = require.context('./../../posts', true, /\.md$/);
    const keys = webpackContext.keys();
    const cleanPathKeys = keys.map(
        (key) => `./${key.split('/')[key.split('/').length - 1]}`
    );
    const dedupedKeys = [...new Set(cleanPathKeys)];
    const values = dedupedKeys.map(webpackContext);
    const posts = dedupedKeys
        .map((key, index) => {
            const id = key
                .replace(/^.*[\\/]/, '')
                .split('.')
                .slice(0, -1)
                .join('.');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value: any = values[index];
            const document = matter(value.default);
            return {
                data: document.data,
                id
            };
        })
        .sort((a, b) => b.data.postNum - a.data.postNum);

    return {
        props: {
            posts,
            title: config.title,
            description: config.description,
            twitterPostTitle: config.twitterPostTitle,
            twitterPostDescription: config.twitterPostDescription,
            twitterPostImage: config.twitterPostImage
        }
    };
};
