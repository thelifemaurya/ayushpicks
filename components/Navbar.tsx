"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Brand } from "./Brand";
import { Ic, PATHS } from "./Icons";
import { INSTAGRAM } from "@/lib/site";
const LINKS = [["Home", "/"], ["Discover", "/search"], ["Categories", "/#categories"], ["Compare", "/compare"]] as const;
const isActive = (path: string, h: string) => (h === "/" ? path === "/" : h === "/search" ? /^\/(search|category|product)/.test(path) : h.startsWith("/#") ? false : path.startsWith(h));
export function SearchBox({ big, onDone, initial = "" }: { big?: boolean; onDone?: () => void; initial?: string }) {
  const { products, recent, addRecent, clearRecent } = useStore();
  const [q, setQ] = useState(initial); const [focus, setFocus] = useState(false); const r = useRouter();
  const go = (t: string) => { const s = t.trim(); if (!s) return; addRecent(s); r.push(`/search?q=${encodeURIComponent(s)}`); setFocus(false); onDone?.(); };
  const sugg = q.length > 1 ? products.filter((p) => `${p.name} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())).slice(0, 4) : [];
  const showRecent = !q && recent.length > 0;
  return (<form role="search" className="relative w-full" onSubmit={(e) => { e.preventDefault(); go(q); }}>
    <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} aria-label="Search products"
      placeholder="Search products, categories, or what you need..." className={`w-full rounded-xl border border-line bg-white px-4 text-sm placeholder:text-muted focus:border-accent ${big ? "h-12 shadow-soft" : "h-10"}`} />
    {focus && (sugg.length > 0 || showRecent) && <div onMouseDown={(e) => e.preventDefault()} className="absolute z-30 mt-1 w-full animate-fade overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-black/10">
      {showRecent ? (<><div className="flex items-center justify-between px-3 pb-1 pt-2 text-xs text-muted"><span>Recent searches</span><button type="button" onClick={clearRecent} className="hover:text-ink">Clear</button></div>
        <ul>{recent.slice(0, 5).map((t) => <li key={t}><button type="button" onClick={() => go(t)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-s2"><Ic d={PATHS.search} className="h-4 w-4 text-muted" />{t}</button></li>)}</ul></>)
        : <ul>{sugg.map((p) => <li key={p.id}><Link href={`/product/${p.slug}`} className="flex justify-between px-3 py-2 text-sm hover:bg-s2"><span>{p.name}</span><span className="text-muted">{p.category}</span></Link></li>)}</ul>}
    </div>}
  </form>);
}
export function Navbar() {
  const [menu, setMenu] = useState(false); const [search, setSearch] = useState(false); const [scrolled, setScrolled] = useState(false);
  const { savedCount, listCount, setListOpen, listOpen } = useStore(); const path = usePathname();
  useEffect(() => { const f = () => setScrolled(window.scrollY > 8); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  const icon = (on: boolean) => `relative hidden h-9 w-9 place-items-center rounded-full transition-colors duration-200 md:grid ${on ? "bg-accent/[0.12] text-accent" : "hover:bg-s2"}`;
  const badge = (n: number) => n > 0 && <span key={n} className="absolute animate-pop right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] leading-none text-white">{n}</span>;
  return (<header className={`sticky top-0 z-40 border-b bg-bg/90 backdrop-blur transition-shadow duration-300 ${scrolled ? "border-line shadow-[0_10px_30px_-18px_rgba(30,28,24,.35)]" : "border-transparent"}`}>
    <div className="wrap flex h-14 items-center justify-between gap-4">
      <Link href="/" aria-label="AyushPicks home"><Brand /></Link>
      <nav aria-label="Primary" className="hidden gap-7 text-sm md:flex">{LINKS.map(([l, h]) => { const on = isActive(path, h); return (<Link key={l} href={h} aria-current={on ? "page" : undefined} className={`relative py-1 transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-accent after:transition-transform after:duration-300 ${on ? "font-medium text-ink after:scale-x-100" : "text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100"}`}>{l}</Link>); })}</nav>
      <div className="flex items-center gap-1">
        <div className="hidden w-56 lg:block"><SearchBox /></div>
        <button aria-label="Search" aria-expanded={search} onClick={() => { setSearch(!search); setMenu(false); }} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-s2 lg:hidden"><Ic d={PATHS.search} /></button>
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer me" aria-label="AyushPicks on Instagram" className="hidden h-9 w-9 place-items-center rounded-lg hover:bg-s2 lg:grid"><svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".8" fill="currentColor" /></svg></a>
        <Link href="/saved" aria-label="Saved products" aria-current={path === "/saved" ? "page" : undefined} className={icon(path === "/saved")}><Ic d={PATHS.heart} fill={path === "/saved"} />{badge(savedCount)}</Link>
        <button onClick={() => setListOpen(true)} aria-label="Your list" aria-haspopup="dialog" className={icon(listOpen)}><Ic d={PATHS.bag} fill={listOpen} />{badge(listCount)}</button>
        <button aria-label="Menu" aria-expanded={menu} onClick={() => { setMenu(!menu); setSearch(false); }} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-s2 md:hidden">☰</button>
      </div></div>
    {(menu || search) && <div className="animate-fade border-t border-line bg-bg lg:hidden"><div className="wrap space-y-1 py-3">
      {search && <SearchBox onDone={() => setSearch(false)} />}
      {menu && [...LINKS, ["Saved", "/saved"] as const].map(([l, h]) => <Link key={l} href={h} onClick={() => setMenu(false)} aria-current={isActive(path, h) ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-sm transition-colors ${isActive(path, h) ? "bg-accent/[0.12] font-medium text-accent" : "hover:bg-s2"}`}>{l}</Link>)}</div></div>}
  </header>);
}
