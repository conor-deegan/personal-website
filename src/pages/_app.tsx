import '@fontsource/inter';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

const colors = {
    brand: {
        darkPrimary: '#030c17',
        lightPrimary: '#fff'
    }
};

const customTheme = {
    styles: {
        global: {
            'html, body': {
                'background-color': colors.brand.darkPrimary
            },
            '*': {
                boxSizing: 'border-box',
                padding: 0,
                margin: 0
            }
        }
    },
    fonts: {
        heading: 'Inter',
        body: 'Inter'
    },
    colors
};

export const theme = extendTheme(customTheme);

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Conor Deegan - Notepad</title>
                <meta name="description" content="Conor Deegan - Notepad" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <ChakraProvider theme={theme}>
                    <Component {...pageProps} />
                </ChakraProvider>
            </main>
        </>
    );
}
