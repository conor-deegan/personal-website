import Link from 'next/link';

import { BlogPosts } from './components/posts';
import { Subscribe } from './components/subscribe';

export default function Page() {
    return (
        <section>
            <div className="mb-12 space-y-4">
                <p>
                    I am a computer scientist and software engineer, currently focused on post-quantum cryptography. My work includes signature schemes, key encapsulation mechanisms, hash-based constructions, lattice-based cryptography, and the symmetric primitives that support them. I am particularly interested in implementation security, side-channel resistance, benchmarking, performance trade-offs, and cryptographic agility in production systems. This site collects my notes on cryptography, implementation, and related engineering work.
                </p>
                <p>
                    I&apos;m co-founder and CTO at{' '}
                    <a
                        href="https://www.projecteleven.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="content-link"
                    >
                        Project Eleven
                    </a>
                    .
                </p>
                <p>
                    At the moment, I also write over on{' '}
                    <a
                        href="https://blog.projecteleven.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="content-link"
                    >
                        the Project Eleven blog
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
