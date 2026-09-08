import Link from "next/link";

export default function NotFound() {
    return (
        <section>
            <h1 className="mb-8 text-2xl font-semibold tracking-tighter">404 - Page Not Found</h1>
        <p className="mb-4">Nothing here sadly</p>
        <Link
            href="/"
            className="content-link"
        >
            Head home
        </Link>
        </section>
    );
}
