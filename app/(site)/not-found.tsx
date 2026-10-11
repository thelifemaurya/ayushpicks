import Link from "next/link";
export default function NotFound() {
  return (<div className="mx-auto max-w-sm px-4 py-24 text-center"><h1 className="text-lg font-medium">Page not found</h1>
    <p className="mt-1 text-sm text-muted">This page doesn&apos;t exist or the product was removed.</p>
    <Link href="/search" className="btn-primary mt-5">Explore Products</Link></div>);
}
