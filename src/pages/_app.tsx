import '@fontsource/inter';
import '@fontsource/ubuntu-mono/400.css';
import '@fontsource/ubuntu-mono/700.css';
import '@fontsource-variable/inconsolata';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { AppProps } from 'next/app';

const colors = {
    brand: {
        darkPrimary: '#000',
        darkSecondary: '#000',
        lightPrimary: '#fff9e6',
        lightSecondary: '#faeecd',
        darkLink: '#0000EE',
        lightLink: '#69b9ff'
    }
};

const customTheme = {
    styles: {
        global: {
            'html, body': {
                backgroundColor: colors.brand.lightPrimary
            },
            '*': {
                boxSizing: 'border-box',
                padding: 0,
                margin: 0
            }
        }
    },
    fonts: {
        heading: 'Inconsolata Variable, Ubuntu Mono, monospace',
        body: 'Inconsolata Variable, Ubuntu Mono, monospace'
    },
    colors,
    initialColorMode: 'light',
    useSystemColorMode: false
};

export const theme = extendTheme(customTheme);

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <>
            <main>
                <ChakraProvider theme={theme}>
                    <Component {...pageProps} />
                </ChakraProvider>
            </main>
        </>
    );
};

export default App;
