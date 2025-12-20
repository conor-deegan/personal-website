import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-mono)', 'monospace'],
                serif: ['var(--font-serif)', 'Georgia', 'serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            colors: {
                border: 'hsl(var(--border))',
            },
        },
    },
    plugins: [],
};

export default config;
