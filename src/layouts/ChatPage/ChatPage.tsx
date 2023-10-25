import { Flex, useColorModeValue } from '@chakra-ui/react';
import Head from 'next/head';

import Header from '../../components/Header/Header';

const ChatPage = ({
    children,
    title,
    description,
    showBack
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    showBack: boolean;
}) => {
    const bg = useColorModeValue('brand.lightPrimary', 'transparent');
    const text = useColorModeValue('brand.darkPrimary', 'brand.lightPrimary');
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta charSet="utf-8" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="twitter:card" content="summary_large_image"></meta>
                <meta name="twitter:site" content="@ConorDeegan4"></meta>
                <meta name="twitter:creator" content="@ConorDeegan4"></meta>
            </Head>
            <Flex
                backgroundAttachment={'fixed'}
                bgGradient={
                    'radial-gradient(at 10% 15%, rgba(8,6,34, 1), rgba(0, 0, 0, 1))'
                }
            >
                <Flex
                    flexDirection={'column'}
                    w={'100%'}
                    h={'100%'}
                    minH={'100vh'}
                    maxH={'100vh'}
                    bg={bg}
                    color={text}
                    textColor={'text'}
                >
                    <Header showBack={showBack} />
                    {children}
                </Flex>
            </Flex>
        </>
    );
};

export default ChatPage;
