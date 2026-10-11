"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Ic, PATHS } from "./Icons";
export function BottomNav() {
  const path = usePathname(); const { savedCount, listCount, setListOpen, listOpen } = useStore();
  const item = (on: boolean) => `group relative flex flex-1 flex-col items-center gap-1 pb-2 pt-3 text-[11px] transition-colors duration-300 ${on ? "font-semibold text-accent" : "font-medium text-muted hover:text-ink"}`;
  const pill = (on: boolean) => `relative grid h-8 w-14 place-items-center rounded-full transition-all duration-300 group-active:scale-90 ${on ? "bg-accent/[0.12]" : "bg-transparent"}`;
  const badge = (n: number) => n > 0 && <span key={n} className="absolute right-1.5 -top-0.5 grid h-4 min-w-4 animate-pop place-items-center rounded-full bg-accent px-1 text-[10px] leading-none text-white">{n}</span>;
  const tabs = [
    { href: "/", label: "Home", d: PATHS.home, on: path === "/" },
    { href: "/search", label: "Search", d: PATHS.search, on: path.startsWith("/search") },
    { href: "/saved", label: "Saved", d: PATHS.heart, on: path === "/saved", n: savedCount },
  ];
  return (<nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
    <div className="mx-auto flex max-w-md">
      {tabs.map((t) => (<Link key={t.href} href={t.href} className={item(t.on)} aria-current={t.on ? "page" : undefined}><span className={pill(t.on)}><Ic d={t.d} fill={t.on} />{badge(t.n ?? 0)}</span>{t.label}</Link>))}
      <button onClick={() => setListOpen(true)} aria-haspopup="dialog" className={item(listOpen)}><span className={pill(listOpen)}><Ic d={PATHS.bag} fill={listOpen} />{badge(listCount)}</span>List</button>
    </div></nav>);
}
