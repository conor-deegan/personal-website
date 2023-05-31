import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';

const Footer = ({ showBack }: { showBack: boolean }) => {
    const link = useColorModeValue('#0000EE', '#69b9ff');
    return (
        <Flex
            fontFamily={'monospace'}
            fontWeight={'normal'}
            color={link}
            fontSize={'14px'}
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
        </Flex>
    );
};

export default Footer;
