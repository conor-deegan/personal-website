import { Box, Flex, Spacer, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';

import ToggleColorMode from '../ToggleColorMode/ToggleColorMode';

const Header = ({ showBack }: { showBack: boolean }) => {
    const link = useColorModeValue('brand.darkLink', 'brand.lightLink');
    const text = useColorModeValue('brand.darkPrimary', 'brand.lightPrimary');
    return (
        <Flex
            fontWeight={'normal'}
            color={link}
            fontSize={'16px'}
            pt={4}
            pb={4}
        >
            {showBack && (
                <Box>
                    ← <Link href="/">Back</Link>
                </Box>
            )}
            {!showBack && (
                <Box color={text}>
                    conordeegan.dev {new Date().getFullYear()}
                </Box>
            )}
            <Spacer />
            <ToggleColorMode />
        </Flex>
    );
};

export default Header;
