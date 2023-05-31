import { Box, Flex, Spacer, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';

import ToggleColorMode from '../ToggleColorMode/ToggleColorMode';

const Header = ({ showBack }: { showBack: boolean }) => {
    const link = useColorModeValue('#0000EE', '#69b9ff');
    const text = useColorModeValue('brand.darkPrimary', 'brand.lightPrimary');
    return (
        <Flex
            fontFamily={'monospace'}
            fontWeight={'normal'}
            color={link}
            fontSize={'14px'}
            pt={4}
            pb={4}
        >
            {showBack && (
                <Box ml={[4, 12]}>
                    ← <Link href="/">Back</Link>
                </Box>
            )}
            {!showBack && (
                <Box ml={[4, 12]} color={text}>
                    conordeegan.dev {new Date().getFullYear()}
                </Box>
            )}
            <Spacer />
            <Box mr={[4, 12]}>
                <ToggleColorMode />
            </Box>
        </Flex>
    );
};

export default Header;
