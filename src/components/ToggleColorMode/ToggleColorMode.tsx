import { Text, useColorMode } from '@chakra-ui/react';

const ToggleColorMode = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <Text onClick={toggleColorMode} cursor={'pointer'}>
            {colorMode === 'dark' ? 'Light' : 'Dark'} mode
        </Text>
    );
};

export default ToggleColorMode;
