import 'katex/dist/katex.min.css';

import { AtpAgent } from '@atproto/api';
import {
    Box,
    Code,
    Flex,
    Heading,
    OrderedList,
    Text,
    UnorderedList,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import { readdirSync } from 'fs';
import matter from 'gray-matter';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import path from 'path';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { HeadingProps } from 'react-markdown/lib/ast-to-react';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import SubscribeForm from '../../components/SubscribeForm/SubsribeForm';
import GenericPage from '../../layouts/GenericPage/GenericPage';

interface IReply {
    post: {
        author: {
            displayName: string;
            handle: string;
        };
        record: {
            text: string;
        };
    };
}

const StyledHeading = (props: HeadingProps) => {
    return (
        <Heading mt={4} mb={4} fontSize={'20px'}>
            {props.children}
        </Heading>
    );
};

const Post = (props: {
    frontmatter: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
    markdownBody: string;
    title: string;
    description: string;
    twitterPostTitle: string;
    twitterPostDescription: string;
    twitterPostImage: string;
}) => {
    const [replies, setReplies] = useState<IReply[]>([]);
    const [postExternalLink, setPostExternalLink] = useState<string>('');
    const { colorMode } = useColorMode();
    if (!props.frontmatter) {
        return <></>;
    }

    const pathname = usePathname();
    const agent = new AtpAgent({ service: 'https://public.api.bsky.app' });

    useEffect(() => {
        const load = async () => {
            const did = 'did:plc:w5zebdsy36zhbufep2bqzg67';
            const post = await agent.app.bsky.feed.searchPosts({
                q: 'www.conordeegan.dev',
                author: did,
                url: `https://conordeegan.dev${pathname}`
            });
            if (post.data.posts.length === 0) {
                return;
            }
            const postUri = post.data.posts[0].uri;
            const postThread = await agent.getPostThread({
                uri: postUri
            });
            if (!postThread.data || !postThread.data.thread) {
                return;
            }
            const fetchedReplies = postThread.data.thread.replies as IReply[];
            setReplies(fetchedReplies);
            setPostExternalLink(
                `https://bsky.app/profile/${did}/post/${
                    postUri.split('/')[postUri.split('/').length - 1]
                }`
            );
        };
        load();
    }, []);

    return (
        <GenericPage
            title={`Conor Deegan | ${props.frontmatter.title}`}
            description={props.description}
            twitterPostTitle={props.twitterPostTitle}
            twitterPostDescription={props.twitterPostDescription}
            twitterPostImage={props.twitterPostImage}
            showBack={true}
        >
            <Flex pb={4}>
                <Heading fontWeight={'bold'} fontSize={'22px'} mt={4}>
                    {props.frontmatter.title}
                </Heading>
            </Flex>
            <ReactMarkdown
                children={props.markdownBody}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    code: (props) => {
                        if (props.inline) {
                            return (
                                <Code
                                    ml={1}
                                    mr={1}
                                    pl={2}
                                    pr={2}
                                    colorScheme={
                                        colorMode === 'light'
                                            ? 'blackAlpha'
                                            : 'gray'
                                    }
                                >
                                    {props.children}
                                </Code>
                            );
                        }
                        return (
                            <Box mt={4} mb={4}>
                                <Code
                                    p={4}
                                    width={'100%'}
                                    overflowX={'auto'}
                                    overflowY={'hidden'}
                                    fontSize={'16px'}
                                    border={'0.5px solid'}
                                    borderColor={
                                        colorMode === 'light'
                                            ? 'blackAlpha.400'
                                            : 'whiteAlpha.400'
                                    }
                                    borderRadius={8}
                                    colorScheme={
                                        colorMode === 'light'
                                            ? 'blackAlpha'
                                            : 'gray'
                                    }
                                >
                                    {props.children}
                                </Code>
                            </Box>
                        );
                    },
                    h1: StyledHeading,
                    h2: StyledHeading,
                    h3: StyledHeading,
                    h4: StyledHeading,
                    h5: StyledHeading,
                    h6: StyledHeading,
                    p: (props) => {
                        return <Text lineHeight={2}>{props.children}</Text>;
                    },
                    img: (props) => {
                        return (
                            <VStack as={'span'} mt={6} mb={6}>
                                <img
                                    src={props.src as string}
                                    alt={props.alt as string}
                                    sizes="100vw"
                                    style={{ width: '50%', height: 'auto' }}
                                />
                                <Text as={'span'}>{props.title}</Text>
                            </VStack>
                        );
                    },
                    a: (props) => {
                        return (
                            <Link
                                href={props.href as string}
                                target={'_blank'}
                                style={{
                                    textDecoration: 'underline',
                                    color:
                                        colorMode === 'light'
                                            ? '#0000EE'
                                            : '#69b9ff'
                                }}
                            >
                                {props.children}
                            </Link>
                        );
                    },
                    ol: (props) => {
                        return (
                            <OrderedList ml={6} mt={4} mb={4} lineHeight={2}>
                                {props.children}
                            </OrderedList>
                        );
                    },
                    ul: (props) => {
                        return (
                            <UnorderedList ml={6} mt={4} mb={4} lineHeight={2}>
                                {props.children}
                            </UnorderedList>
                        );
                    }
                }}
            />
            <Heading mt={4} mb={4} fontSize={'20px'}>
                Subscribe
            </Heading>
            <SubscribeForm />
            {postExternalLink !== '' && (
                <>
                    <Heading mt={8} mb={2} fontSize={'20px'}>
                        Replies
                    </Heading>
                    <Text>
                        Replies are pulled directly from the post on BlueSky.
                        Add your reply{' '}
                        <Link
                            href={postExternalLink}
                            target={'_blank'}
                            style={{
                                textDecoration: 'underline',
                                color:
                                    colorMode === 'light'
                                        ? '#0000EE'
                                        : '#69b9ff'
                            }}
                        >
                            here
                        </Link>
                        . Or if you are interested to see how this works, see
                        the note{' '}
                        <Link
                            href={'/posts/comments'}
                            style={{
                                textDecoration: 'underline',
                                color:
                                    colorMode === 'light'
                                        ? '#0000EE'
                                        : '#69b9ff'
                            }}
                        >
                            here
                        </Link>
                        .
                    </Text>
                    <Box>
                        {replies.map((reply, index) => {
                            return (
                                <Box key={index} mt={4} mb={4}>
                                    <Text fontWeight={'bold'}>
                                        {reply.post.author.displayName}
                                    </Text>
                                    <Text>{reply.post.record.text}</Text>
                                </Box>
                            );
                        })}
                    </Box>
                </>
            )}
        </GenericPage>
    );
};

export default Post;

export const getStaticProps = async (context: {
    params: {
        id: string;
    };
}) => {
    const { id } = context.params;
    const config = await import('../../config/config.json');
    const content = await import(`../../../posts/${id}.md`);
    const data = matter(content.default);
    return {
        props: {
            title: config.title,
            description: config.description,
            twitterPostTitle: config.twitterPostTitle,
            twitterPostDescription: config.twitterPostDescription,
            twitterPostImage: config.twitterPostImage,
            frontmatter: data.data,
            markdownBody: data.content
        }
    };
};

export const getStaticPaths = async () => {
    const postsDirectory = path.join(__dirname, '../../../../posts');
    const posts = readdirSync(path.join(postsDirectory), 'utf-8');
    const paths = posts.map((slug) => `/posts/${slug.replace('.md', '')}`);
    return { paths, fallback: false };
};
