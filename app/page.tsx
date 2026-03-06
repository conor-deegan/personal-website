import Link from 'next/link';

import { BlogPosts } from './components/posts';
import { Subscribe } from './components/subscribe';

export default function Page() {
    return (
        <section>
            <div className="mb-12 space-y-4">
                <h1 className="text-2xl font-semibold tracking-tight leading-tight mb-4">
                    Conor Deegan
                </h1>
                <p>
                    I&apos;m a computer scientist and software engineer. I work on post-quantum cryptography.
                </p>
                <p>
                    I&apos;m  the co-founder and CTO of{' '}
                    <a
                        href="https://www.projecteleven.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="content-link"
                    >
                        Project Eleven
                    </a>
                    . I also write on the{' '}
                    <a
                        href="https://blog.projecteleven.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="content-link"
                    >
                        Project Eleven blog
                    </a>
                    .
                </p>
            </div>

            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-6 tracking-tight">Writing</h2>
                <BlogPosts />
            </section>

            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-6 tracking-tight">Projects/Research</h2>
                <Link href={'https://eprint.iacr.org/2026/380'} target='_blank' rel='noopener noreferrer' className="group">
                    <article className="mb-4">
                        <h3 className="group-hover:text-[hsl(var(--accent))] transition-colors">
                            Lattice HD Wallets
                        </h3>
                        <p>Post-quantum BIP32 Hierarchical Deterministic Wallets from Lattice Assumptions</p>
                    </article>
                </Link>
                <Link href={'https://github.com/PQC-Suite-B/'} target='_blank' rel='noopener noreferrer' className="group">
                    <article className="mb-4">
                        <h3 className="group-hover:text-[hsl(var(--accent))] transition-colors">
                            PQC Suite B
                        </h3>
                        <p>Performance optimizations for post-quantum signature schemes with the BLAKE3 hash function</p>
                    </article>
                </Link>
                <Link href={'https://github.com/conor-deegan/benching-pq/'} target='_blank' rel='noopener noreferrer' className="group">
                    <article className="mb-4">
                        <h3 className="group-hover:text-[hsl(var(--accent))] transition-colors">
                            Benchmarking post-quantum signatures
                        </h3>
                        <p>Benchmarking post-quantum signatures against ECDSA</p>
                    </article>
                </Link>
            </section>

            <section>
                <Subscribe />
            </section>
        </section >
    );
}
