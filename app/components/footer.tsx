function ArrowIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
                fill="currentColor"
            />
        </svg>
    );
}

const socialLinks = [
    { href: 'https://x.com/conordeegan4', label: 'X' },
    { href: 'https://github.com/conor-deegan', label: 'GitHub' },
    { href: '/rss', label: 'RSS' },
];

export default function Footer() {
    return (
        <footer className="mt-20 mb-12 pt-8 border-t border-border">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm">
                {socialLinks.map(({ href, label }) => (
                    <li key={href}>
                        <a
                            className="nav-link flex items-center gap-2"
                            rel="noopener noreferrer"
                            target={href.startsWith('/') ? undefined : '_blank'}
                            href={href}
                        >
                            <ArrowIcon />
                            <span>{label}</span>
                        </a>
                    </li>
                ))}
            </ul>
            <p className="mt-6 text-subtle text-sm font-sans">
                My PGP is{' '}
                <a href="/pgp.txt" className="content-link font-mono text-sm">
                    9EC530B5788C0870
                </a>
            </p>
            <p className="mt-6 text-subtle text-sm font-sans">
                © {new Date().getFullYear()} Conor Deegan
            </p>
        </footer>
    );
}
