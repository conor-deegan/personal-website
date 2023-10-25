import {
    Box,
    Flex,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import { ChangeEvent, useState } from 'react';
import { BsFillArrowRightCircleFill } from 'react-icons/bs';

import { Messages } from '../components/Messages/Messages';
import ChatPage from '../layouts/ChatPage/ChatPage';
import { api } from '../utils/api';

export interface IMessage {
    from: string;
    text: string;
}

const CV = (props: { title: string; description: string }) => {
    const [input, setInput] = useState('');
    const [placeholder, setPlaceholder] = useState('Why should I hire you?');
    const [isInvalid, setIsInvalid] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<IMessage[]>([
        {
            from: 'bot',
            text: 'Hey, nice to meet you. My name is Conor 👋'
        }
    ]);

    const bg = useColorModeValue('brand.lightSecondary', 'brand.darkSecondary');
    const text = useColorModeValue('brand.darkPrimary', 'brand.lightPrimary');

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) =>
        setInput(event.target.value);

    const handleKeyDown = (key: string) => {
        if (key !== 'Enter') return;
        handleInputSubmit();
    };

    const handleInputSubmit = async () => {
        try {
            if (!input.trim().length) {
                setIsInvalid(true);
                return;
            }
            setIsTyping(true);
            getRandomPlaceholder();
            setMessages((old) => [...old, { from: 'user', text: input }]);
            setInput('');
            const res = await api.chatCompletion(input);
            if (!res) {
                // triggerErrorToast('Something went wrong, please try again.');
                return;
            }
            setMessages((old) => [...old, { from: 'bot', text: res.answer }]);
            setIsTyping(false);
        } catch (error) {
            setIsTyping(false);
            // triggerErrorToast(
            //     error.message
            //         ? error.message
            //         : 'Something went wrong, please try again.'
            // );
        }
    };

    const getRandomPlaceholder = () => {
        const placeholders = [
            'What is your favourite colour?',
            'What is your favourite food?',
            'What is your availability?',
            'Tell me about your experience',
            'What do you like to do outside of work?',
            'Tell me about your weaknesses?',
            'What is your favourite book?'
        ];
        const randomIndex = Math.floor(Math.random() * placeholders.length);
        setPlaceholder(placeholders[randomIndex]);
    };
    return (
        <ChatPage
            title={props.title}
            description={props.description}
            showBack={false}
        >
            <Flex justifyContent={'center'} alignItems={'center'} pt={[0, 10]}>
                <Flex
                    direction={'column'}
                    borderRadius={10}
                    padding={5}
                    overflow={'scroll'}
                    backgroundColor={bg}
                    css={{
                        '&::-webkit-scrollbar': {
                            display: 'none'
                        }
                    }}
                    height={['90vh', '80vh']}
                    width={['100vw', '80vw']}
                >
                    <HStack
                        height={'10%'}
                        backgroundColor={bg}
                        direction={'column'}
                        overflow={'scroll'}
                    >
                        <Text fontWeight={'bold'} color={text}>
                            Conor | Active
                        </Text>
                        <Box
                            backgroundColor={'green.300'}
                            height={2}
                            width={2}
                            borderRadius={'100%'}
                        ></Box>
                    </HStack>
                    <Flex
                        height={'80%'}
                        backgroundColor={bg}
                        direction={'column'}
                        overflow={'scroll'}
                    >
                        <Messages messages={messages} isTyping={isTyping} />
                    </Flex>
                    <Flex
                        height={'10%'}
                        backgroundColor={'white'}
                        borderRadius={'10'}
                    >
                        <InputGroup height={'100%'}>
                            <Input
                                height={'100%'}
                                placeholder={placeholder}
                                css={{
                                    '::placeholder': {
                                        color: '#696969'
                                    }
                                }}
                                onChange={(e) => {
                                    setIsInvalid(false);
                                    handleInputChange(e);
                                }}
                                onKeyDown={(e) => handleKeyDown(e.key)}
                                value={input}
                                isInvalid={isInvalid}
                                errorBorderColor="red.500"
                                focusBorderColor="black.500"
                                color={'brand.darkPrimary'}
                                backgroundColor={'#f7f7f7'}
                            />
                            <InputRightElement width="4.5rem" height={'100%'}>
                                <Icon
                                    as={BsFillArrowRightCircleFill}
                                    boxSize={6}
                                    cursor="pointer"
                                    color={'brand.darkPrimary'}
                                    onClick={() => handleInputSubmit()}
                                />
                            </InputRightElement>
                        </InputGroup>
                    </Flex>
                </Flex>
            </Flex>
        </ChatPage>
    );
};

export default CV;

export const getStaticProps = async () => {
    // getting the website config
    const config = await import('./../config/config.json');
    return {
        props: {
            title: 'C.V.',
            description: config.description
        }
    };
};
