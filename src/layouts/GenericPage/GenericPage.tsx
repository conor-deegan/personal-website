import { Box, Flex, Spacer, useColorModeValue } from '@chakra-ui/react';
import Head from 'next/head';

import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';

const GenericPage = ({
    children,
    title,
    description,
    twitterPostTitle,
    twitterPostDescription,
    twitterPostImage,
    showBack
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    twitterPostTitle: string;
    twitterPostDescription: string;
    twitterPostImage: string;
    showBack: boolean;
}) => {
    const bg = useColorModeValue('brand.lightPrimary', 'brand.darkPrimary');
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
                <meta name="twitter:title" content={twitterPostTitle}></meta>
                <meta
                    name="twitter:description"
                    content={twitterPostDescription}
                ></meta>
                <meta name="twitter:image" content={twitterPostImage}></meta>
            </Head>
            <Flex
                flexDirection={'column'}
                w={'100%'}
                h={'100%'}
                minH={'100vh'}
                bg={bg}
                color={text}
                textColor={text}
            >
                <Header showBack={showBack} />
                <Box
                    ml={[4, 12]}
                    mr={[4, 0]}
                    maxW={'40rem'}
                    fontFamily={'monospace'}
                    fontSize={'14px'}
                >
                    {children}
                </Box>
                <Spacer />
                <Footer showBack={showBack} />
            </Flex>
        </>
    );
};

export default GenericPage;
