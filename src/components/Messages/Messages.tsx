import {
    Box,
    Flex,
    HStack,
    Icon,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { FaRobot } from 'react-icons/fa';

import { IMessage } from '../../pages/cv';
import { Typing } from '../Typing/Typing';

export type Messages = {
    messages: IMessage[];
    isTyping: boolean;
};

export const Messages = ({ messages, isTyping }: Messages) => {
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const text = useColorModeValue('brand.darkPrimary', 'brand.lightPrimary');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <Flex flexDirection="column" width={'100%'} marginBottom={'2'}>
            {messages.map((item, index) => {
                if (item.from === 'user') {
                    return (
                        <HStack key={index} w="100%" justify="flex-end">
                            <Box
                                backgroundColor={'rgba(255, 255, 255, .15)'}
                                backdropFilter={'blur(4px) brightness(120%)'}
                                backdropBlur={'4px'}
                                backdropBrightness={'120%'}
                                color={text}
                                maxW="45%"
                                my="1"
                                p="3"
                                borderRadius={10}
                            >
                                <Text>{item.text}</Text>
                            </Box>
                        </HStack>
                    );
                } else {
                    return (
                        <HStack key={index} w="100%" my="1" alignItems={'end'}>
                            <Icon as={FaRobot} w={5} h={5} color={text} />
                            <Box
                                backgroundColor={'rgba(255, 255, 255, .15)'}
                                backdropFilter={'blur(4px) brightness(120%)'}
                                backdropBlur={'4px'}
                                backdropBrightness={'120%'}
                                color={text}
                                maxW="45%"
                                p="3"
                                borderRadius={10}
                            >
                                <Text>{item.text}</Text>
                            </Box>
                        </HStack>
                    );
                }
            })}
            {isTyping && (
                <HStack w="100%" my="1" alignItems={'end'}>
                    <Icon as={FaRobot} w={5} h={5} color={text} />
                    <Box
                        backgroundColor={'rgba(255, 255, 255, .15)'}
                        backdropFilter={'blur(4px) brightness(120%)'}
                        backdropBlur={'4px'}
                        backdropBrightness={'120%'}
                        color={text}
                        maxW="45%"
                        p="3"
                        borderRadius={10}
                    >
                        <Typing />
                    </Box>
                </HStack>
            )}
            <div ref={messagesEndRef} />
        </Flex>
    );
};
