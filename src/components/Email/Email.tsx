import * as React from 'react';

interface EmailTemplateProps {
    email: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    email
}: {
    email: string;
}) => (
    <div>
        <p>New subscriber</p>
        <p>Email</p>
        <p>{email}</p>
    </div>
);
