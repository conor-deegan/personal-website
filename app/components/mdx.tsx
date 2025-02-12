import { highlight } from 'sugar-high';
import Image from 'next/image';
import Link from 'next/link';
import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote/rsc';
import React from 'react';

function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
    const headers = data.headers.map((header: string, index: number) => (
        <th key={index}>{header}</th>
    ));
    const rows = data.rows.map((row: string[], index: number) => (
        <tr key={index}>
            {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
            ))}
        </tr>
    ));

    return (
        <table>
            <thead>
                <tr>{headers}</tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}

function CustomLink(props: { href: string; children: React.ReactNode }) {
    const href = props.href;

    if (href.startsWith('/')) {
        return (
            <Link {...props} className="text-blue-500 hover:underline">
                {props.children}
            </Link>
        );
    }

    if (href.startsWith('#')) {
        return <a {...props} />;
    }

    return <a target="_blank" rel="noopener noreferrer" {...props} className='text-blue-500 hover:underline' />;
}
function RoundedImage(props: {
    src: string;
    width?: number;
    height?: number;
    className?: string;
    alt: string;
}) {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image className="rounded-lg" {...props} />;
}

function InlineCode({
    children,
    className,
    style,
    ...props
}: {
    children: string;
    className?: string;
    style?: React.CSSProperties;
}) {
    const codeHTML = highlight(children);
    const defaultStyle = {
        backgroundColor: '#f5f5f5',
        padding: '0.2em 0.4em',
        borderRadius: '4px',
        fontFamily: 'monospace',
    };
    return (
        <code
            dangerouslySetInnerHTML={{ __html: codeHTML }}
            className={className}
            style={{ ...defaultStyle, ...style }}
            {...props}
        />
    );
}

function CodeBlock({
    children,
    className,
    style,
    ...props
}: {
    children: {
        props: {
            children: string;
            className: string;
        };
    };
    className?: string;
    style?: React.CSSProperties;
}) {
    const codeHTML = highlight(children.props.children);
    const defaultStyle = {
        backgroundColor: '#f5f5f5',
        padding: '0.8em',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '0.8em',
        overflowX: 'auto' as const, // Ensure horizontal scrolling for long lines
    };
    return (
        <pre style={{ ...defaultStyle, ...style }} className={className} {...props}>
            <code dangerouslySetInnerHTML={{ __html: codeHTML }} />
        </pre>
    );
}

function slugify(str: string) {
    return str
        .toString()
        .toLowerCase()
        .trim() // Remove whitespace from both ends of a string
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
        .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

function createHeading(level: number) {
    const Heading = ({ children }: { children: string }) => {
        const slug = slugify(children);
        const style = {
            fontSize: '1.2em',
            fontWeight: '500',
        };
        return React.createElement(
            `h${level}`,
            { id: slug, style },
            [
                React.createElement('a', {
                    href: `#${slug}`,
                    key: `link-${slug}`,
                    className: 'anchor',
                }),
            ],
            children,
        );
    };

    Heading.displayName = `Heading${level}`;

    return Heading;
}

const components = {
    h1: createHeading(1),
    h2: createHeading(2),
    h3: createHeading(3),
    h4: createHeading(4),
    h5: createHeading(5),
    h6: createHeading(6),
    Image: RoundedImage,
    a: CustomLink,
    code: InlineCode,
    pre: CodeBlock,
    Table,
};

export function CustomMDX(props: MDXRemoteProps) {
    return (
        <MDXRemote
            source={props.source}
            components={{ ...components, ...(props.components || {}) }}
        />
    );
}
