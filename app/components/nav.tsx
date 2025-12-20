import Link from 'next/link';

const navItems = {
    '/': { name: 'home' },
    '/blog': { name: 'writing' },
};

export function Navbar() {
    return (
        <nav className="mb-16" aria-label="Main navigation">
            <ul className="flex items-center gap-6 font-sans text-sm">
                {Object.entries(navItems).map(([path, { name }]) => (
                    <li key={path}>
                        <Link href={path} className="nav-link">
                            {name}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
