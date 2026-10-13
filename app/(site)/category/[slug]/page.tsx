import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, slugify } from "@/lib/data";
import { getProducts } from "@/lib/products";
import { EmptyState } from "@/components/ui";
import { StoreGrid } from "@/components/StoreGrid";
import { JsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/site";
type P = { params: Promise<{ slug: string }> };
export const revalidate = 60;
export const generateStaticParams = () => CATEGORIES.map((c) => ({ slug: slugify(c) }));
async function load(slug: string) {
  const all = await getProducts(); const items = all.filter((p) => slugify(p.category) === slug);
  const name = CATEGORIES.find((c) => slugify(c) === slug) ?? items[0]?.category; return { name, items };
}
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { name, items } = await load((await params).slug); if (!name) return {};
  return { title: `${name}: Products Worth Considering`, description: `Explore ${name} products on AyushPicks: what they do, how they compare and what's worth buying.`,
    alternates: { canonical: `/category/${slugify(name)}` }, ...(items.length ? {} : { robots: { index: false, follow: true } }) };
}
export default async function Category({ params }: P) {
  const { name, items } = await load((await params).slug); if (!name) notFound();
  const url = `${SITE}/category/${slugify(name)}`;
  return (<div className="wrap py-10">
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name, item: url }] }} />
    {items.length > 0 && <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name, itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/product/${p.slug}`, name: p.name })) }} />}
    <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted"><Link href="/" className="hover:text-ink">Home</Link> / <span aria-current="page">{name}</span></nav>
    <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
    <p className="mt-1 text-sm text-muted">{items.length} {items.length === 1 ? "product" : "products"} worth a look.</p>
    <h2 className="sr-only">Products in {name}</h2>
    {items.length ? <StoreGrid items={items} /> : <div className="mt-6"><EmptyState title="Nothing here yet" text="We're adding products to this category. Try another one meanwhile." action={<Link href="/#categories" className="btn-ghost">Browse categories</Link>} /></div>}
    <p className="mt-8 text-sm text-muted">Missing a product you love? <Link href="/suggest" className="text-accent underline">Suggest it</Link>.</p>
    <h2 className="mb-3 mt-14 text-lg font-semibold">Other categories</h2>
    <div className="flex flex-wrap gap-2">{CATEGORIES.filter((c) => c !== name).map((c) => <Link key={c} href={`/category/${slugify(c)}`} className="chip hover:border-accent hover:text-ink">{c}</Link>)}</div>
  </div>);
}
