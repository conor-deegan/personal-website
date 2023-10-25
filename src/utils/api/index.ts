import axios, { AxiosError } from 'axios';

const baseUrl = 'https://cv-llm-dev-rafx.2.ie-1.fl0.io';

axios.interceptors.request.use(
    async (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = accessToken;
        }
        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);

export const api = {
    chatCompletion: async (
        question: string
    ): Promise<
        | {
              answer: string;
          }
        | undefined
    > => {
        try {
            const response = await axios.post(`${baseUrl}`, { question });
            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                throw new Error(error.response?.data.message);
            }
        }
    }
};
