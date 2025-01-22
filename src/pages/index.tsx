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
import SubscribeForm from '../components/SubscribeForm/SubsribeForm';
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
            <Heading mb={4} fontSize={'20px'}>
                About
            </Heading>
            <Box>
                <Text>
                    I'm a Software Engineer. Mostly interested in Cryptography,
                    Platform Engineering, and AI. I have a MSc in Distributed
                    Systems and AI.
                </Text>
            </Box>
            <Heading mt={4} mb={4} fontSize={'20px'}>
                Posts
            </Heading>
            <PostList
                posts={props.posts.filter((post) => post.data.type === 'post')}
            />
            <Heading mt={4} mb={4} fontSize={'20px'}>
                Notes
            </Heading>
            <PostList
                posts={props.posts.filter((post) => post.data.type === 'note')}
            />
            <Heading mt={4} mb={4} fontSize={'20px'}>
                Research
            </Heading>
            <VStack align={'left'}>
                <Text>
                    State of Web Scale Agent AI:{' '}
                    <Link
                        href={'/papers/state-of-web-scale-agents.pdf'}
                        color={link}
                        target={'_blank'}
                    >
                        Link
                    </Link>
                </Text>
                <Text>
                    Achieving Web Scale Agent AI:{' '}
                    <Link
                        href={'/papers/web-scale-agents.pdf'}
                        color={link}
                        target={'_blank'}
                    >
                        Link
                    </Link>
                </Text>
            </VStack>
            <Heading mt={4} mb={4} fontSize={'20px'}>
                Subscribe
            </Heading>
            <SubscribeForm />
            <Heading mt={4} mb={4} fontSize={'20px'}>
                Contact
            </Heading>
            <VStack align={'left'}>
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
            <VStack align={'left'}>
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
