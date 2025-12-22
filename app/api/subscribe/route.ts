import { checkBotId } from 'botid/server';
import { NextRequest } from 'next/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BAD_EMAIL_RESPONSE = Response.json(
    { error: 'Please enter a valid email address' },
    { status: 400 },
);

const SERVICE_ERROR_RESPONSE = Response.json(
    { error: 'Something went wrong. Please try again later.' },
    { status: 500 },
);

/**
 * Extracts and validates email from request body
 * @param request - The incoming request
 * @returns The validated email or null if invalid
 */
async function extractEmail(request: NextRequest): Promise<string | null> {
    try {
        const body = (await request.json()) as { email?: string };
        const email = body.email?.trim().toLowerCase();
        if (!email || !EMAIL_REGEX.test(email)) {
            return null;
        }
        return email;
    } catch {
        return null;
    }
}

/**
 * Subscribes an email to Buttondown
 * @param email - The validated email address
 * @returns True if successful, false otherwise
 */
async function subscribeToButtondown(email: string): Promise<boolean> {
    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
        console.error('BUTTONDOWN_API_KEY environment variable is not set');
        return false;
    }

    const response = await fetch('https://api.buttondown.com/v1/subscribers', {
        method: 'POST',
        headers: {
            Authorization: `Token ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_address: email }),
    });

    if (!response.ok) {
        console.error(`Buttondown API error (${response.status}):`, await response.text());
    }

    return response.ok;
}

/**
 * POST handler for email subscription
 * Validates the request, checks for bots, and adds the subscriber to Buttondown
 */
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const verification = await checkBotId();
        if (verification.isBot) {
            return SERVICE_ERROR_RESPONSE;
        }

        const email = await extractEmail(request);
        if (!email) {
            return BAD_EMAIL_RESPONSE;
        }

        const success = await subscribeToButtondown(email);
        if (!success) {
            return SERVICE_ERROR_RESPONSE;
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('Subscribe endpoint error:', error);
        return SERVICE_ERROR_RESPONSE;
    }
}
