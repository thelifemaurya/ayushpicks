"use client";
import { useMemo, useState } from "react";
import { Product, hasStore, storesOf } from "@/lib/data";
import { ProductGrid } from "./ui";
// Product grid with "All / Amazon / Flipkart / Myntra…" filter chips built from each product's store links.
export function StoreGrid({ items }: { items: Product[] }) {
  const [store, setStore] = useState("");
  const stores = useMemo(() => storesOf(items), [items]);
  const shown = useMemo(() => (store ? items.filter((p) => hasStore(p, store)) : items), [items, store]);
  return (<>
    {stores.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Filter by store"><span className="text-muted">Store:</span>
      <button aria-pressed={!store} onClick={() => setStore("")} className={`chip transition ${!store ? "!border-accent !text-accent" : "hover:text-ink"}`}>All</button>
      {stores.map((x) => <button key={x.key} aria-pressed={store === x.key} onClick={() => setStore(store === x.key ? "" : x.key)} className={`chip transition ${store === x.key ? "!border-accent !text-accent" : "hover:text-ink"}`}>{x.label} ({x.count})</button>)}</div>}
    <div className="mt-6"><ProductGrid items={shown} /></div>
  </>);
}
