import { Box, Icon, useColorMode } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { PiMoonStarsDuotone, PiSunDuotone } from 'react-icons/pi';

const ToggleColorMode = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <Box
            as={motion.div}
            whileHover={{ rotate: 15 }}
            onClick={toggleColorMode}
            cursor={'pointer'}
            transition="0.1s spring"
        >
            <Icon
                as={colorMode === 'dark' ? PiSunDuotone : PiMoonStarsDuotone}
                w={5}
                h={5}
            />
        </Box>
    );
};

export default ToggleColorMode;
