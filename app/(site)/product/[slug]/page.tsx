import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { slugify, clip, fmt, fmtN, sortedOffers, checkedOn } from "@/lib/data";
import { getProducts } from "@/lib/products";
import { ProductGallery, Price, Rating, Stars, SaveButton, CompareButton, ProductCard } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/site";
type P = { params: Promise<{ slug: string }> };
export const revalidate = 60;
export const generateStaticParams = async () => (await getProducts()).map((p) => ({ slug: p.slug }));
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params; const p = (await getProducts()).find((x) => x.slug === slug); if (!p) return {};
  const desc = clip([p.verdict.summary, p.description].filter(Boolean).join(" ") || `${p.name}: features, pros, limitations and where to buy.`);
  const title = `${p.name} — Features, Pros & Limitations`;
  return { title, description: desc, alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: `${title} | AyushPicks`, description: desc, url: `/product/${p.slug}`, siteName: "AyushPicks", type: "website", ...(p.images[0] ? { images: [{ url: p.images[0], alt: p.name }] } : {}) } };
}
const Sec = ({ t, children }: { t: string; children: React.ReactNode }) => <section className="mt-10"><h2 className="mb-3 text-xl font-semibold tracking-tight">{t}</h2>{children}</section>;
export default async function ProductPage({ params }: P) {
  const { slug } = await params; const all = await getProducts(); const p = all.find((x) => x.slug === slug); if (!p) notFound();
  const alts = p.alternatives.map((s) => all.find((x) => x.slug === s)).filter((x): x is NonNullable<typeof x> => !!x);
  const related = all.filter((x) => x.category === p.category && x.id !== p.id && !p.alternatives.includes(x.slug)).slice(0, 3);
  const catHref = `/category/${slugify(p.category)}`;
  const offers = sortedOffers(p); const priced = offers.filter((o) => o.price != null);
  const lowest = priced.length > 1 && priced[0].price! < priced[1].price! ? priced[0].url : "";
  const specs = Object.entries(p.specifications); const scores = Object.entries(p.verdict.scores);
  const ld: Record<string, unknown> = { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description || p.verdict.summary || p.name, category: p.category, url: `${SITE}/product/${p.slug}`, mainEntityOfPage: `${SITE}/product/${p.slug}`,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined, image: p.images.length ? p.images : undefined };
  if (p.rating > 0 && p.reviewCount > 0) ld.aggregateRating = { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount, bestRating: 5 };
  if (priced.length) ld.offers = priced.map((o) => ({ "@type": "Offer", price: o.price, priceCurrency: p.currency, url: o.url, seller: { "@type": "Organization", name: o.name } }));
  else if (p.price != null && p.retailers[0]) ld.offers = { "@type": "Offer", price: p.price, priceCurrency: p.currency, url: p.retailers[0].url };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: p.category, item: `${SITE}${catHref}` },
    { "@type": "ListItem", position: 3, name: p.name, item: `${SITE}/product/${p.slug}` }] };
  return (<div className="wrap py-8">
    <JsonLd data={ld} /><JsonLd data={crumbs} />
    <nav aria-label="Breadcrumb" className="mb-5 text-xs text-muted"><Link href="/" className="hover:text-ink">Home</Link> / <Link href={catHref} className="hover:text-ink">{p.category}</Link> / <span aria-current="page">{p.name}</span></nav>
    <div className="grid gap-8 md:grid-cols-2">
      <ProductGallery p={p} />
      <div>
        <p className="text-xs text-muted">{p.category}{p.subcategory ? ` · ${p.subcategory}` : ""}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{p.name}</h1>
        {p.description && <p className="mt-2 text-muted">{p.description}</p>}
        <div className="mt-3 flex items-center gap-3"><Rating value={p.rating} count={p.reviewCount} size="md" /></div>{fmt(p) && <div className="mt-3"><Price p={p} big /></div>}
        {p.features.length > 0 && <ul className="mt-5 space-y-1.5 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><span className="text-accent" aria-hidden>•</span>{f}</li>)}</ul>}
        <div className="mt-6 flex flex-wrap gap-2">
          {offers.map((r, i) => <a key={r.url} href={r.url} target="_blank" rel="sponsored nofollow noopener noreferrer" className={i === 0 ? "btn-primary" : "btn-ghost"}>View at {r.name}{r.price != null ? ` · ${fmtN(r.price, p.currency)}` : ""} ↗</a>)}
          <SaveButton id={p.id} label /><CompareButton id={p.id} label /></div>
        <p className="mt-2 text-xs text-muted">{p.retailers.length ? `You'll be redirected to the retailer to complete your purchase. ${checkedOn(p)} Prices may change.` : "This product isn't available from our retailers right now."}</p>
      </div></div>
    {offers.length > 1 && <Sec t="Compare prices across stores"><div className="overflow-x-auto rounded-xl border border-line"><table className="w-full min-w-[420px] text-sm">
      <caption className="sr-only">Prices for {p.name} at different stores</caption>
      <thead className="bg-s1 text-left text-xs text-muted"><tr><th scope="col" className="px-4 py-2.5 font-normal">Store</th><th scope="col" className="px-4 py-2.5 font-normal">Price</th><th scope="col" className="px-4 py-2.5 font-normal">Discount</th><th scope="col" className="px-4 py-2.5"><span className="sr-only">Link</span></th></tr></thead>
      <tbody>{offers.map((o) => { const d = o.mrp != null && o.price != null && o.mrp > o.price ? Math.round((1 - o.price / o.mrp) * 100) : 0;
        return (<tr key={o.url} className="border-t border-line"><th scope="row" className="px-4 py-3 text-left font-medium">{o.name}{o.url === lowest && <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">Lowest listed</span>}</th>
          <td className="px-4 py-3">{o.price != null ? <>{fmtN(o.price, p.currency)}{d > 0 && o.mrp != null && <span className="ml-2 text-xs text-muted line-through">{fmtN(o.mrp, p.currency)}</span>}</> : <span className="text-muted">Check store</span>}</td>
          <td className="px-4 py-3 text-muted">{d > 0 ? `${d}% off` : "—"}</td>
          <td className="px-4 py-3 text-right"><a href={o.url} target="_blank" rel="sponsored nofollow noopener noreferrer" className="font-medium text-accent hover:underline">View deal ↗</a></td></tr>); })}</tbody></table></div>
      <p className="mt-2 text-xs text-muted">{checkedOn(p) || "Prices are what we saw when we last checked."} Prices change often. Confirm the final price on the store&apos;s page.</p></Sec>}
    <Sec t="Overview"><p className="max-w-3xl text-muted">{p.description}{p.bestFor.length > 0 && ` Best suited to ${p.bestFor.join(", ").toLowerCase()}.`}</p></Sec>
    {specs.length > 0 && <Sec t="Key features"><dl className="divide-y divide-line rounded-xl border border-line bg-s1">{specs.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>)}</dl></Sec>}
    {(p.pros.length > 0 || p.limitations.length > 0) && <Sec t="Pros & limitations"><div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-line bg-s1 p-4"><h3 className="mb-2 text-sm font-medium">Pros</h3><ul className="space-y-1.5 text-sm text-muted">{p.pros.map((x) => <li key={x}>+ {x}</li>)}</ul></div>
      <div className="rounded-xl border border-line bg-s1 p-4"><h3 className="mb-2 text-sm font-medium">Limitations</h3><ul className="space-y-1.5 text-sm text-muted">{p.limitations.map((x) => <li key={x}>– {x}</li>)}</ul></div></div></Sec>}
    {p.howToUse.length > 0 && <Sec t="How to use"><ol className="max-w-3xl list-decimal space-y-2 pl-5 text-sm text-muted">{p.howToUse.map((x) => <li key={x}>{x}</li>)}</ol></Sec>}
    {p.conditions.length > 0 && <Sec t="Conditions & what to check"><ul className="max-w-3xl space-y-2 text-sm text-muted">{p.conditions.map((x) => <li key={x} className="flex gap-2"><span className="text-accent" aria-hidden>•</span>{x}</li>)}</ul></Sec>}
    {(p.verdict.summary || scores.length > 0) && <Sec t="AyushPicks Verdict"><div className="rounded-xl border border-accent/30 bg-s1 p-5">{p.verdict.summary && <p className="max-w-2xl">{p.verdict.summary}</p>}
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">{scores.map(([k, v]) => <div key={k} className="flex items-center justify-between"><dt className="text-muted">{k}</dt><dd><Stars value={v} /></dd></div>)}</dl></div></Sec>}
    {(p.bestFor.length > 0 || p.notIdealFor.length > 0) && <Sec t="Who is it for?"><div className="grid gap-4 md:grid-cols-2">
      <div><h3 className="mb-2 text-sm font-medium">Good for</h3><div className="flex flex-wrap gap-2">{p.bestFor.map((x) => <span key={x} className="chip !text-ink">{x}</span>)}</div></div>
      <div><h3 className="mb-2 text-sm font-medium">Not ideal for</h3><div className="flex flex-wrap gap-2">{p.notIdealFor.map((x) => <span key={x} className="chip">{x}</span>)}</div></div></div></Sec>}
    {alts.length > 0 && <Sec t="Alternatives worth a look"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{alts.map((a) => <ProductCard key={a.id} p={a} />)}</div></Sec>}
    {related.length > 0 && <Sec t={`More in ${p.category}`}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((a) => <ProductCard key={a.id} p={a} />)}</div></Sec>}
  </div>);
}
