import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { baseUrl } from './sitemap';
import Footer from './components/footer';
import { Crimson_Pro, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';
// import { Navbar } from './components/nav';
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

const crimsonPro = Crimson_Pro({
    variable: '--font-serif',
    subsets: ['latin'],
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    variable: '--font-mono',
    subsets: ['latin'],
    display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${crimsonPro.variable} ${jetbrainsMono.variable}`}>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className="antialiased max-w-2xl mx-auto px-6 md:px-8 mt-12 lg:mt-16">
                <main className="flex-auto min-w-0 flex flex-col">
                    {/* <Navbar /> */}
                    {children}
                    <Footer />
                    <Analytics />
                    <SpeedInsights />
                </main>
            </body>
        </html>
    );
}
