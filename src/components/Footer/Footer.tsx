import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';

const Footer = ({ showBack }: { showBack: boolean }) => {
    const link = useColorModeValue('brand.darkLink', 'brand.lightLink');
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
                    <Box>
                        ← <Link href="/">Back</Link>
                    </Box>
                </>
            )}
        </Flex>
    );
};

export default Footer;
