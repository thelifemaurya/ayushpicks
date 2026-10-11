"use client";
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "./data";
type Ctx = {
  products: Product[]; saved: string[]; compare: string[]; list: string[]; recent: string[]; savedCount: number; listCount: number; listOpen: boolean; setListOpen: (o: boolean) => void;
  toggleSave: (id: string) => void; toggleCompare: (id: string) => void; clearCompare: () => void; toggleList: (id: string) => void; clearList: () => void;
  addRecent: (q: string) => void; clearRecent: () => void; toast: (m: string) => void;
};
const C = createContext<Ctx | null>(null);
export const useStore = () => { const c = useContext(C); if (!c) throw new Error("StoreProvider missing"); return c; };
const KEYS = { saved: "ks:saved", compare: "ks:compare", list: "ks:list", recent: "ks:recent" } as const;
const read = (k: string): string[] => { try { const v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string") : []; } catch { return []; } };
const write = (k: string, v: string[]) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
// Everything is remembered in this browser (no login needed) and stays in sync across tabs.
export function StoreProvider({ children, products }: { children: ReactNode; products: Product[] }) {
  const [saved, setSaved] = useState<string[]>([]); const [compare, setCompare] = useState<string[]>([]);
  const [list, setList] = useState<string[]>([]); const [recent, setRecent] = useState<string[]>([]);
  const [listOpen, setListOpen] = useState(false); const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    setSaved(read(KEYS.saved)); setCompare(read(KEYS.compare)); setList(read(KEYS.list)); setRecent(read(KEYS.recent));
    const sync = (e: StorageEvent) => {
      if (e.key === KEYS.saved) setSaved(read(KEYS.saved)); if (e.key === KEYS.compare) setCompare(read(KEYS.compare));
      if (e.key === KEYS.list) setList(read(KEYS.list)); if (e.key === KEYS.recent) setRecent(read(KEYS.recent));
    };
    window.addEventListener("storage", sync); return () => window.removeEventListener("storage", sync);
  }, []);
  const toast = useCallback((m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2200); }, []);
  const flip = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const toggleSave = (id: string) => { const n = flip(saved, id); setSaved(n); write(KEYS.saved, n); toast(saved.includes(id) ? "Removed from saved" : "Saved"); };
  const toggleList = (id: string) => { const n = flip(list, id); setList(n); write(KEYS.list, n); toast(list.includes(id) ? "Removed from your list" : "Added to your list"); };
  const clearList = () => { setList([]); write(KEYS.list, []); };
  const toggleCompare = (id: string) => {
    if (!compare.includes(id) && compare.length >= 3) { toast("You can compare up to 3 products"); return; }
    const n = flip(compare, id); setCompare(n); write(KEYS.compare, n);
  };
  const clearCompare = () => { setCompare([]); write(KEYS.compare, []); };
  const addRecent = useCallback((q: string) => {
    const t = q.trim().slice(0, 80); if (!t) return;
    setRecent((p) => { const n = [t, ...p.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8); write(KEYS.recent, n); return n; });
  }, []);
  const clearRecent = useCallback(() => { setRecent([]); write(KEYS.recent, []); }, []);
  const ids = new Set(products.map((p) => p.id));
  const savedCount = saved.filter((i) => ids.has(i)).length; const listCount = list.filter((i) => ids.has(i)).length;
  return (<C.Provider value={{ products, saved, compare, list, recent, savedCount, listCount, listOpen, setListOpen, toggleSave, toggleCompare, clearCompare, toggleList, clearList, addRecent, clearRecent, toast }}>
    {children}
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4">
      {msg && <div className="animate-fade rounded-xl border border-line bg-ink px-3 py-2 text-sm text-white shadow-lg">{msg}</div>}
    </div></C.Provider>);
}
