import { HStack, Text } from '@chakra-ui/react';

import styles from './Typing.module.css';

export const Typing = () => {
    return (
        <HStack>
            <Text>Conor's AI is typing</Text>
            <span className={styles.dotOne}></span>
            <span className={styles.dotTwo}></span>
            <span className={styles.dotThree}></span>
        </HStack>
    );
};
