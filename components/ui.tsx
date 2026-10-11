"use client";
import Link from "next/link";
import { useEffect, useRef, useState, ReactNode } from "react";
import { Product, fmt, fmtMrp, discountPct } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Ic, PATHS } from "./Icons";
import { Reveal } from "./Reveal";

export function Rating({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "md" }) {
  if (!(value > 0)) return <span className="text-xs text-muted">Not rated yet</span>;
  return (<span className={`inline-flex items-center gap-1 ${size === "md" ? "text-sm" : "text-xs"}`} aria-label={`Rated ${value} out of 5`}>
    <span className="text-gold" aria-hidden>★</span><span className="font-medium">{value.toFixed(1)}</span>
    {!!count && <span className="text-muted">({count.toLocaleString("en-IN")})</span>}</span>);
}
export function Price({ p, big = false }: { p: Product; big?: boolean }) {
  if (p.price == null) return null; const d = discountPct(p);
  return (<span className="inline-flex flex-wrap items-baseline gap-x-2">
    <span className={big ? "text-2xl font-semibold tracking-tight" : "text-sm font-medium"}>{fmt(p)}</span>
    {d > 0 && <><span className="text-xs text-muted line-through">{fmtMrp(p)}</span><span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-xs font-medium text-accent">{d}% off</span></>}</span>);
}
export function Stars({ value }: { value: number }) {
  const n = Math.max(0, Math.min(5, Math.round(value)));
  return <span className="tracking-wider text-gold" aria-label={`${value} out of 5`}>{"★".repeat(n)}<span className="text-line">{"★".repeat(5 - n)}</span></span>;
}
export const altText = (p: Product, i = 0) => `${p.name}${p.subcategory ? ` ${p.subcategory.toLowerCase()}` : ""}${i ? ` – photo ${i + 1}` : ""}`;
export function ProductImage({ p, className = "", priority = false, idx = 0 }: { p: Product; className?: string; priority?: boolean; idx?: number }) {
  const src = p.images[idx];
  if (src) return (<div className={`relative overflow-hidden bg-s1 ${className}`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt={altText(p, idx)} width={800} height={800} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : undefined} className="h-full w-full object-contain p-3" /></div>);
  const h = [...p.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (<div role="img" aria-label={`${altText(p)} (image coming soon)`} className={`relative grid place-items-center overflow-hidden bg-s2 ${className}`}
    style={{ backgroundImage: `radial-gradient(circle at 30% 20%, hsl(${h} 20% 90%), transparent 65%)` }}>
    <span className="text-3xl font-semibold tracking-tight text-ink/15">{p.brand || p.name}</span></div>);
}
export function ProductGallery({ p }: { p: Product }) {
  const [i, setI] = useState(0);
  return (<div>
    <ProductImage p={p} idx={i} priority className="aspect-square rounded-xl border border-line" />
    {p.images.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto">{p.images.map((_, k) => (
      <button key={k} onClick={() => setI(k)} aria-label={`Show photo ${k + 1}`} aria-pressed={i === k} className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border ${i === k ? "border-accent" : "border-line"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.images[k]} alt="" width={56} height={56} loading="lazy" decoding="async" className="h-full w-full object-contain" /></button>))}</div>}
  </div>);
}
export function SaveButton({ id, label }: { id: string; label?: boolean }) {
  const { saved, toggleSave } = useStore(); const on = saved.includes(id);
  return (<button onClick={(e) => { e.preventDefault(); toggleSave(id); }} aria-pressed={on} aria-label={on ? "Remove from saved" : "Save product"}
    className={label ? "btn-ghost" : "grid h-9 w-9 place-items-center rounded-full border border-line bg-white/90 shadow-sm backdrop-blur transition duration-200 hover:scale-105 hover:bg-white active:scale-95"}>
    <svg key={String(on)} viewBox="0 0 24 24" aria-hidden className={`h-[18px] w-[18px] ${on ? "animate-pop text-accent" : ""}`} fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={PATHS.heart} /></svg>
    {label && (on ? "Saved" : "Save")}</button>);
}
export function CompareButton({ id, label }: { id: string; label?: boolean }) {
  const { compare, toggleCompare } = useStore(); const on = compare.includes(id);
  return (<button onClick={(e) => { e.preventDefault(); toggleCompare(id); }} aria-pressed={on}
    className={`btn-ghost ${label ? "" : "px-2.5 py-1 text-xs"} ${on ? "!border-accent text-accent" : ""}`}>{on ? "✓ Comparing" : "Compare"}</button>);
}
export function DropdownMenu({ product }: { product: Product }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  const { toggleSave, toggleCompare, toast } = useStore();
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  const item = (t: string, fn: () => void) => <button role="menuitem" onClick={() => { fn(); setOpen(false); }} className="block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-s2">{t}</button>;
  return (<div ref={ref} className="relative">
    <button aria-label="More actions" aria-haspopup="menu" aria-expanded={open} onClick={(e) => { e.preventDefault(); setOpen(!open); }} className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white/90 shadow-sm backdrop-blur transition duration-200 hover:scale-105 hover:bg-white active:scale-95">⋯</button>
    {open && <div role="menu" className="absolute right-0 top-11 z-30 w-36 animate-fade rounded-lg border border-line bg-bg p-1 shadow-xl shadow-black/10">
      {item("Save", () => toggleSave(product.id))}{item("Compare", () => toggleCompare(product.id))}
      {item("Share", () => { navigator.clipboard?.writeText(`${location.origin}/product/${product.slug}`); toast("Link copied"); })}
      {item("Report", () => toast("Thanks, we'll review this"))}</div>}</div>);
}
export function AddToList({ id }: { id: string }) {
  const { list, toggleList } = useStore(); const on = list.includes(id);
  return (<button onClick={() => toggleList(id)} aria-pressed={on} className={`btn w-full border py-2 ${on ? "border-accent bg-accent/10 text-accent" : "border-line bg-s1 hover:border-muted/60"}`}><Ic d={PATHS.bag} className="h-4 w-4" />{on ? "In your list" : "Quick add"}</button>);
}
export function ProductCard({ p }: { p: Product }) {
  return (<article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-muted/40 hover:shadow-lg hover:shadow-black/10">
    <Link href={`/product/${p.slug}`} className="flex flex-1 flex-col" aria-label={p.name}>
      <div className="overflow-hidden"><ProductImage p={p} className="aspect-[4/3] transition-transform duration-300 group-hover:scale-[1.03]" /></div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between text-xs text-muted"><span>{p.category}</span>{p.badge && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">{p.badge}</span>}</div>
        <h3 className="text-base font-medium leading-snug">{p.name}</h3>
        <p className="line-clamp-2 text-sm text-muted">{p.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2"><Rating value={p.rating} count={p.reviewCount} /><Price p={p} /></div>
      </div></Link>
    <div className="px-4 pb-4"><AddToList id={p.id} /></div>
    <div className="absolute right-3 top-3 flex gap-2"><SaveButton id={p.id} /><DropdownMenu product={p} /></div>
  </article>);
}
export function ProductGrid({ items, cols = 3 }: { items: Product[]; cols?: 3 | 4 }) {
  return <div className={`grid gap-4 sm:grid-cols-2 ${cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>{items.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 70} className="h-full"><ProductCard p={p} /></Reveal>)}</div>;
}
export function EmptyState({ title, text, action, level = 2 }: { title: string; text: string; action?: ReactNode; level?: 1 | 2 }) {
  const T = level === 1 ? "h1" : "h2";
  return <div className="mx-auto max-w-sm py-20 text-center"><T className="text-lg font-medium">{title}</T><p className="mt-1 text-sm text-muted">{text}</p><div className="mt-5">{action}</div></div>;
}
export function Skeleton({ className = "" }: { className?: string }) { return <div className={`animate-pulse rounded-lg bg-s2 ${className}`} />; }
export function CompareBar() {
  const { compare, clearCompare } = useStore();
  if (!compare.length) return null;
  return (<div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 border-t border-line bg-bg/95 backdrop-blur md:bottom-0"><div className="wrap flex items-center justify-between py-3 text-sm">
    <span>{compare.length} selected <span className="text-muted">· up to 3</span></span>
    <span className="flex gap-2"><button onClick={clearCompare} className="btn-ghost">Clear</button><Link href="/compare" className="btn-primary">Compare</Link></span></div></div>);
}
