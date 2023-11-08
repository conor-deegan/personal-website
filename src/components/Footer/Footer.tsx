import {
    Box,
    Flex,
    Show,
    Spacer,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';

const Footer = ({ showBack }: { showBack: boolean }) => {
    const [display, setDisplay] = useState(false);
    const link = useColorModeValue('brand.darkLink', 'brand.lightLink');
    const text = useColorModeValue('brand.darkPrimary', 'brand.lightPrimary');
    return (
        <Flex
            fontWeight={'normal'}
            color={link}
            fontSize={'16px'}
            pt={4}
            pb={10}
        >
            {showBack && (
                <>
                    <Box ml={[4, 12]}>
                        ← <Link href="/">Back</Link>
                    </Box>
                </>
            )}
            <Spacer />
            <Show breakpoint="(min-width: 600px)">
                <Flex
                    onMouseEnter={() => setDisplay(true)}
                    onMouseLeave={() => setDisplay(false)}
                    w={480}
                    fontSize={10}
                    cursor={'crosshair'}
                >
                    <Text mr={[4, 12]} color={display ? text : 'transparent'}>
                        It does not do to dwell on dreams and forget to live -
                        Albus Dumbledore
                    </Text>
                </Flex>
            </Show>
        </Flex>
    );
};

export default Footer;
