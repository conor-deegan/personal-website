import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormValues = {
    email: string;
};

function SubsribeForm() {
    const button = useColorModeValue('blackAlpha', 'gray');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>();

    const onSubmit = handleSubmit(async (data) => {
        try {
            await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            setIsSubscribed(true);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    });

    if (isSubscribed) {
        return <Text>Subscribed! I'll send you new posts directly.</Text>;
    }

    return (
        <form onSubmit={onSubmit}>
            <FormControl isInvalid={!!errors.email}>
                <FormLabel htmlFor="email" fontSize={'18px'}>
                    Subscribe to new posts
                </FormLabel>
                <Input
                    w={['100%', '350px']}
                    id="email"
                    type="email"
                    placeholder="Email"
                    {...register('email', {
                        required: 'Email is required'
                    })}
                />
                <FormErrorMessage>
                    {errors.email && errors.email.message}
                </FormErrorMessage>
            </FormControl>
            <Button
                colorScheme={button}
                mt={4}
                isLoading={isSubmitting}
                type="submit"
                fontFamily={'body'}
            >
                Submit
            </Button>
        </form>
    );
}

export default SubsribeForm;
