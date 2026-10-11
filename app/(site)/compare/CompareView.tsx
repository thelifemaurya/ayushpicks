"use client";
import Link from "next/link";
import { fmt, fmtN, sortedOffers, Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { EmptyState, Stars } from "@/components/ui";
export function CompareView() {
  const { compare, toggleCompare, products } = useStore();
  const items = compare.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);
  const head = <h1 className="text-3xl font-semibold tracking-tight">Compare products</h1>;
  if (items.length < 2) return (<div className="wrap py-10">{head}<EmptyState title={items.length === 0 ? "Nothing to compare yet" : "Add one more product"} text={items.length === 0 ? "Pick two or three products to see how they differ." : `${items[0].name} is selected. Compare needs at least two products.`} action={<Link href="/search" className="btn-primary">{items.length ? "Choose another" : "Explore Products"}</Link>} /></div>);
  const prices = items.map((p) => p.price).filter((n): n is number => n != null); const minP = prices.length ? Math.min(...prices) : -1;
  const maxR = Math.max(...items.map((p) => p.rating));
  const row = (label: string, cell: (p: Product) => React.ReactNode, mark?: (p: Product) => boolean) => (
    <tr className="border-t border-line align-top"><th scope="row" className="sticky left-0 bg-bg px-3 py-3 text-left text-xs font-normal text-muted">{label}</th>
      {items.map((p) => <td key={p.id} className={`px-3 py-3 ${mark?.(p) ? "font-medium text-accent" : ""}`}>{cell(p)}</td>)}</tr>);
  const keys = [...new Set(items.flatMap((p) => Object.keys(p.verdict.scores)))].filter((k) => k !== "Overall");
  return (<div className="wrap py-10">{head}
    <div className="mt-6 overflow-x-auto rounded-xl border border-line"><table className="w-full min-w-[640px] text-sm">
      <caption className="sr-only">Product comparison</caption>
      <thead><tr><td className="sticky left-0 bg-bg" />{items.map((p) => <th key={p.id} scope="col" className="px-3 py-3 text-left font-medium"><Link href={`/product/${p.slug}`} className="hover:text-accent">{p.name}</Link><button onClick={() => toggleCompare(p.id)} className="ml-2 text-xs text-muted hover:text-ink" aria-label={`Remove ${p.name}`}>✕</button></th>)}</tr></thead>
      <tbody>
        {row("Price", (p) => fmt(p) || "—", (p) => p.price != null && p.price === minP)}
        {row("Where to buy", (p) => (p.retailers.length ? <ul className="space-y-1">{sortedOffers(p).map((r) => <li key={r.url}><a href={r.url} target="_blank" rel="sponsored nofollow noopener noreferrer" className="text-accent hover:underline">{r.name}{r.price != null ? ` ${fmtN(r.price, p.currency)}` : ""} ↗</a></li>)}</ul> : "—"))}
        {row("Rating", (p) => (p.rating > 0 ? `${p.rating.toFixed(1)} (${p.reviewCount.toLocaleString("en-IN")})` : "Not rated yet"), (p) => p.rating > 0 && p.rating === maxR)}
        {keys.map((k) => row(k, (p) => (p.verdict.scores[k] != null ? <Stars value={p.verdict.scores[k]} /> : "—")))}
        {row("Key features", (p) => <ul className="space-y-1">{p.features.slice(0, 3).map((f) => <li key={f}>{f}</li>)}</ul>)}
        {row("Limitations", (p) => <ul className="space-y-1 text-muted">{p.limitations.map((f) => <li key={f}>{f}</li>)}</ul>)}
        {row("AyushPicks verdict", (p) => <span className="text-muted">{p.verdict.summary || "—"}</span>)}
      </tbody></table></div>
    <p className="mt-2 text-xs text-muted">Highlighted values are the lowest price and highest rating in each row.</p>
    <h2 className="mb-3 mt-10 text-xl font-semibold">Which should you choose?</h2>
    <div className="grid gap-3 md:grid-cols-3">{items.map((p) => <div key={p.id} className="rounded-xl border border-line bg-s1 p-4 text-sm"><h3 className="font-medium">{p.name}</h3>
      <p className="mt-1 text-muted">{p.bestFor[0] ? `Choose this if you're after something for ${p.bestFor[0].toLowerCase()}.` : "See the product page for who it suits best."}{p.notIdealFor[0] ? ` Skip it if you need ${p.notIdealFor[0].toLowerCase()}.` : ""}</p></div>)}</div>
  </div>);
}
