import 'katex/dist/katex.min.css';

import {
    Box,
    Code,
    Flex,
    Heading,
    OrderedList,
    Spacer,
    Text,
    UnorderedList,
    useColorMode,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { readdirSync } from 'fs';
import matter from 'gray-matter';
import Link from 'next/link';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import { HeadingProps } from 'react-markdown/lib/ast-to-react';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import GenericPage from '../../layouts/GenericPage/GenericPage';

const StyledHeading = (props: HeadingProps) => {
    return (
        <Heading mt={4} mb={4} fontSize={'16px'}>
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
    const link = useColorModeValue('brand.darkLink', 'brand.lightLink');
    const text = useColorModeValue('brand.darkPrimary', 'brand.lightPrimary');
    const border = useColorModeValue('brand.darkPrimary', 'brand.lightPrimary');
    const { colorMode } = useColorMode();
    if (!props.frontmatter) {
        return <></>;
    }
    return (
        <GenericPage
            title={`Conor Deegan | ${props.frontmatter.title}`}
            description={props.description}
            twitterPostTitle={props.twitterPostTitle}
            twitterPostDescription={props.twitterPostDescription}
            twitterPostImage={props.twitterPostImage}
            showBack={true}
        >
            <Flex
                borderBottom={'0.5px solid'}
                borderBottomColor={border}
                pb={4}
            >
                <Box fontWeight={'bold'} fontSize={'16px'}>
                    {props.frontmatter.title}
                </Box>
                <Spacer />
                <Box fontWeight={'bold'} fontSize={'16px'}>
                    {props.frontmatter.date}
                </Box>
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
                            <Box mt={4} mb={4} ml={4} mr={4}>
                                <Code
                                    p={4}
                                    width={'100%'}
                                    overflow={'scroll'}
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
                        return (
                            <Text lineHeight={2} ml={6}>
                                {props.children}
                            </Text>
                        );
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
                            <Link href={props.href as string} target={'_blank'}>
                                <span style={{ color: link }}>
                                    {props.children}
                                </span>
                            </Link>
                        );
                    },
                    ol: (props) => {
                        return (
                            <OrderedList ml={12} mt={4} mb={4}>
                                {props.children}
                            </OrderedList>
                        );
                    },
                    ul: (props) => {
                        return (
                            <UnorderedList ml={12} mt={4} mb={4}>
                                {props.children}
                            </UnorderedList>
                        );
                    }
                }}
            />
            <Box ml={[4, 12]} mt={4} color={text} textAlign={'center'}>
                --- E.O.F ---
            </Box>
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
