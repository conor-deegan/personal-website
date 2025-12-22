'use client';

import { type ChangeEvent, type FormEvent, useCallback, useState } from 'react';

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error';

interface SubscribeErrorResponse {
    error: string;
}

/**
 * Validates an email address format on the client side
 * @param email - The email address to validate
 * @returns True if the email format is valid, false otherwise
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Newsletter subscription component with email validation and error handling
 */
export function Subscribe() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<SubscribeStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [validationError, setValidationError] = useState('');

    const validateEmail = useCallback((value: string): boolean => {
        if (!value.trim()) {
            setValidationError('Email is required');
            return false;
        }
        if (!isValidEmail(value.trim())) {
            setValidationError('Please enter a valid email address');
            return false;
        }
        setValidationError('');
        return true;
    }, []);

    const handleEmailChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setEmail(value);
            // Clear validation error on change, but only validate on blur or submit
            if (validationError) {
                setValidationError('');
            }
            // Reset error state when user starts typing again
            if (status === 'error') {
                setStatus('idle');
                setErrorMessage('');
            }
        },
        [validationError, status],
    );

    const handleBlur = useCallback(() => {
        if (email.trim()) {
            validateEmail(email);
        }
    }, [email, validateEmail]);

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            // Validate before submitting
            if (!validateEmail(email)) {
                return;
            }

            setStatus('loading');
            setErrorMessage('');

            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email.trim() }),
                });

                if (response.ok) {
                    setStatus('success');
                    setEmail('');
                } else {
                    const data = (await response.json()) as SubscribeErrorResponse;
                    setStatus('error');
                    setErrorMessage(data.error ?? 'Something went wrong. Please try again.');
                }
            } catch {
                setStatus('error');
                setErrorMessage('Something went wrong. Please try again.');
            }
        },
        [email, validateEmail],
    );

    // Success state
    if (status === 'success') {
        return (
            <div>
                <p className="text-sm text-muted">
                    Thanks for subscribing — check your inbox to confirm.
                </p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm text-muted mb-3">Get notified when I publish new writing.</p>

            <form onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col sm:flex-row gap-2">
                    <label htmlFor="email-input" className="sr-only">
                        Email address
                    </label>
                    <input
                        id="email-input"
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={handleBlur}
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={status === 'loading'}
                        aria-invalid={Boolean(validationError || errorMessage)}
                        aria-describedby={
                            validationError
                                ? 'validation-error'
                                : errorMessage
                                  ? 'submit-error'
                                  : undefined
                        }
                        className={`flex-1 px-3 py-2 bg-transparent text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] border rounded font-sans text-sm transition-colors duration-150 focus:outline-none focus:border-[hsl(var(--accent))] disabled:opacity-50 disabled:cursor-not-allowed ${validationError || errorMessage ? 'border-red-500/50' : 'border-border hover:border-[hsl(var(--foreground-muted))]'}`}
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="px-4 py-2 border border-border rounded text-[hsl(var(--foreground-muted))] font-sans text-sm transition-colors duration-150 hover:border-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </div>

                {/* Validation error */}
                {validationError && (
                    <p id="validation-error" role="alert" className="mt-2 text-xs text-red-500/80">
                        {validationError}
                    </p>
                )}

                {/* API error */}
                {status === 'error' && errorMessage && (
                    <p id="submit-error" role="alert" className="mt-2 text-xs text-red-500/80">
                        {errorMessage}
                    </p>
                )}
            </form>
        </div>
    );
}
