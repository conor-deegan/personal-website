import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

import { EmailTemplate } from '../../components/Email/Email';

const resend = new Resend(process.env.RESEND_API_KEY);

type ResponseData = {
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (!req.body.email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    const emailResponse = await resend.emails.send({
        from: 'Conor <conor@conordeegan.dev>',
        to: ['conorjdeegan@gmail.com'],
        subject: 'New Subscriber',
        react: EmailTemplate({ email: req.body.email })
    });

    if (emailResponse.error) {
        return res.status(400).json(emailResponse.error);
    }

    res.status(200).json({
        message: 'Success'
    });
}
