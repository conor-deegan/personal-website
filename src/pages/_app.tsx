import '@fontsource/inter';
import '@fontsource/ubuntu-mono/400.css';
import '@fontsource/ubuntu-mono/700.css';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { AppProps } from 'next/app';

const colors = {
    brand: {
        darkPrimary: '#000',
        darkSecondary: '#110e1f',
        lightPrimary: '#FDF4DC',
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
        heading: 'Ubuntu Mono, monospace',
        body: 'Ubuntu Mono, monospace'
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
