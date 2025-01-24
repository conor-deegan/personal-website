import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { baseUrl } from './sitemap';
import Footer from './components/footer';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { Navbar } from './components/nav';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: 'Conor Deegan',
        template: '%s | Conor Deegan',
    },
    description: 'Thoughts made into words.',
    openGraph: {
        title: 'Conor Deegan',
        description: 'Thoughts made into words.',
        url: baseUrl,
        siteName: 'Conor Deegan',
        locale: 'en_US',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} text-black bg-white dark:text-white dark:bg-black`}
        >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
                <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
                    <Navbar />
                    {children}
                    <Footer />
                    <Analytics />
                    <SpeedInsights />
                </main>
            </body>
        </html>
    );
}
