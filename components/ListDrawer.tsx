"use client";
import Link from "next/link";
import { useEffect } from "react";
import { fmt } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Price, ProductImage } from "./ui";
export function ListDrawer() {
  const { products, list, toggleList, clearList, listOpen, setListOpen } = useStore();
  useEffect(() => {
    if (!listOpen) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setListOpen(false);
    document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k);
  }, [listOpen, setListOpen]);
  if (!listOpen) return null;
  const items = products.filter((p) => list.includes(p.id));
  const known = items.filter((p) => p.price != null); const total = known.reduce((s, p) => s + (p.price ?? 0), 0);
  return (<div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your list">
    <button aria-label="Close list" onClick={() => setListOpen(false)} className="absolute inset-0 animate-backdrop bg-ink/30" />
    <aside className="absolute bottom-0 right-0 flex max-h-[85vh] w-full animate-slide-up flex-col rounded-t-3xl border border-line bg-bg shadow-2xl sm:top-0 sm:max-h-none sm:w-[400px] sm:animate-slide-in sm:rounded-none sm:rounded-l-3xl">
      <header className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="text-base font-semibold">Your list <span className="text-muted">({items.length})</span></h2>
        <button onClick={() => setListOpen(false)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-s2">✕</button></header>
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {items.length === 0 ? <div className="py-12 text-center"><p className="font-medium">Your list is empty</p><p className="mt-1 text-sm text-muted">Tap “Quick add” on any product to collect it here. We remember it on this device, no login needed.</p>
          <Link href="/search" onClick={() => setListOpen(false)} className="btn-primary mt-5">Explore Products</Link></div>
          : <ul className="divide-y divide-line">{items.map((p) => (<li key={p.id} className="flex gap-3 py-3">
            <ProductImage p={p} className="h-16 w-16 shrink-0 rounded-xl border border-line" />
            <div className="min-w-0 flex-1"><Link href={`/product/${p.slug}`} onClick={() => setListOpen(false)} className="line-clamp-2 text-sm font-medium hover:text-accent">{p.name}</Link>
              <div className="mt-1"><Price p={p} /></div>
              <div className="mt-2 flex items-center gap-3 text-xs">{p.retailers[0] && <a href={p.retailers[0].url} target="_blank" rel="sponsored nofollow noopener noreferrer" className="font-medium text-accent hover:underline">View at {p.retailers[0].name} ↗</a>}
                <button onClick={() => toggleList(p.id)} className="text-muted hover:text-ink">Remove</button></div></div></li>))}</ul>}
      </div>
      {items.length > 0 && <footer className="border-t border-line px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {known.length > 0 && <div className="flex items-baseline justify-between text-sm"><span className="text-muted">Estimated total</span><span className="text-lg font-semibold">{fmt({ ...known[0], price: total })}</span></div>}
        <p className="mt-1 text-xs text-muted">AyushPicks doesn&apos;t sell products. There&apos;s no checkout here: use each “View at” link to buy from the retailer. Prices may change.</p>
        <button onClick={clearList} className="btn-ghost mt-3 w-full">Clear list</button></footer>}
    </aside></div>);
}
