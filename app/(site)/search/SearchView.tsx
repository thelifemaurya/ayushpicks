"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SearchBox } from "@/components/Navbar";
import { CATEGORIES, hasStore, storesOf } from "@/lib/data";
import { search } from "@/lib/search";
import { useStore } from "@/lib/store";
import { EmptyState, ProductGrid } from "@/components/ui";
export function SearchView() {
  const { products, recent, addRecent, clearRecent } = useStore(); const router = useRouter();
  const sp = useSearchParams(); const q = sp.get("q") ?? ""; const cat = sp.get("category") ?? "";
  useEffect(() => { if (q.trim()) addRecent(q); }, [q, addRecent]);
  const [sort, setSort] = useState("relevance"); const [minRating, setMinRating] = useState(0); const [tag, setTag] = useState(""); const [store, setStore] = useState(sp.get("store") ?? "");
  const stores = useMemo(() => storesOf(products), [products]);
  const base = useMemo(() => search(products, q).filter((p) => !cat || p.category === cat), [products, q, cat]);
  const tags = useMemo(() => [...new Set(base.flatMap((p) => p.tags))].slice(0, 8), [base]);
  const items = useMemo(() => {
    const r = base.filter((p) => p.rating >= minRating && (!tag || p.tags.includes(tag)) && (!store || hasStore(p, store)));
    if (sort === "rating") r.sort((a, b) => b.rating - a.rating);
    if (sort === "price") r.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    return r;
  }, [base, sort, minRating, tag, store]);
  const sel = "rounded-lg border border-line bg-bg px-2 py-1.5 text-sm";
  const setCat = (c: string) => router.push(`/search?${q ? `q=${encodeURIComponent(q)}&` : ""}${c ? `category=${encodeURIComponent(c)}` : ""}`);
  return (<div className="wrap py-10">
    <h1 className="text-3xl font-semibold tracking-tight">{q ? `Results for “${q}”` : cat || "Discover"}</h1>
    <p className="mt-1 text-sm text-muted">{items.length} of {products.length} products</p>
    <div className="mt-4 max-w-xl"><SearchBox key={q} initial={q} /></div>
    {!q && !cat && recent.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><span className="text-muted">Recent:</span>{recent.map((r) => <Link key={r} href={`/search?q=${encodeURIComponent(r)}`} className="chip hover:border-accent hover:text-ink">{r}</Link>)}<button onClick={clearRecent} className="text-xs text-muted underline">Clear</button></div>}
    <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
      <select aria-label="Sort" className={sel} value={sort} onChange={(e) => setSort(e.target.value)}><option value="relevance">Relevance</option><option value="rating">Top rated</option><option value="price">Price: low to high</option></select>
      <select aria-label="Minimum rating" className={sel} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}><option value={0}>Any rating</option><option value={4}>4.0+</option><option value={4.5}>4.5+</option></select>
      <select aria-label="Category" className={sel} value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      {stores.length > 0 && <select aria-label="Store" className={sel} value={store} onChange={(e) => setStore(e.target.value)}><option value="">All stores</option>{stores.map((x) => <option key={x.key} value={x.key}>{x.label} ({x.count})</option>)}</select>}
      {tags.map((t) => <button key={t} aria-pressed={tag === t} onClick={() => setTag(tag === t ? "" : t)} className={`chip transition ${tag === t ? "!border-accent !text-accent" : "hover:text-ink"}`}>{t}</button>)}
    </div>
    <h2 className="sr-only">Results</h2>
    <div className="mt-6">{items.length ? <ProductGrid items={items} /> : <EmptyState title="No products found" text="Try a different search or explore one of our categories. Can't find something? Suggest it and we'll look into adding it." action={<span className="flex flex-wrap justify-center gap-2"><Link href="/#categories" className="btn-ghost">Browse categories</Link><Link href="/suggest" className="btn-primary">Suggest a product</Link></span>} />}</div>
  </div>);
}
