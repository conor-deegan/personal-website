import '@fontsource/inter';
import '@fontsource/ubuntu-mono/400.css';
import '@fontsource/ubuntu-mono/700.css';
import '@fontsource-variable/fraunces';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';

interface IGlobalStylesProps {
    colorMode: 'dark' | 'light';
}

const colors = {
    brand: {
        darkPrimary: '#000',
        darkSecondary: '#17181c',
        lightPrimary: '#fff9e6',
        lightSecondary: '#faeecd',
        darkLink: '#0000EE',
        lightLink: '#69b9ff'
    }
};

const config = {
    initialColorMode: 'dark',
    useSystemColorMode: true
};

const customTheme = extendTheme({
    config,
    styles: {
        global: (props: IGlobalStylesProps) => ({
            'html, body': {
                backgroundColor:
                    props.colorMode === 'dark'
                        ? colors.brand.darkSecondary
                        : colors.brand.lightPrimary,
                color:
                    props.colorMode === 'dark'
                        ? colors.brand.lightPrimary
                        : colors.brand.darkSecondary
            },
            '*': {
                boxSizing: 'border-box',
                padding: 0,
                margin: 0
            }
        })
    },
    fonts: {
        body: 'Inter, sans-serif',
        heading: 'Fraunces Variable',
        mono: 'Ubuntu Mono, monospace'
    },
    colors
});

export const theme = customTheme;

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <>
            <main>
                <ChakraProvider theme={theme}>
                    <Component {...pageProps} />
                    <Analytics />
                </ChakraProvider>
            </main>
        </>
    );
};

export default App;
