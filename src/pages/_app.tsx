import '@fontsource/inter';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { AppProps } from 'next/app';

const colors = {
    brand: {
        darkPrimary: '#000',
        lightPrimary: '#fff'
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
        heading: 'Inter',
        body: 'Inter'
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
