"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { sb } from "@/lib/sb";
import { AutomationTab } from "@/components/AutomationTab";
import { PostMaker } from "@/components/PostMaker";
import { ADMIN_EMAIL, BUCKET } from "@/lib/site";
import { CATEGORIES, slugify } from "@/lib/data";

const T = "ayushpicks_products";
const EMPTY = { id: "", name: "", slug: "", brand: "", category: CATEGORIES[0], subcategory: "", description: "", images: "", rating: "", review_count: "0", price: "", mrp: "", discount: "",
  features: "", pros: "", limitations: "", specifications: "", best_for: "", not_ideal_for: "", verdict_summary: "", verdict_scores: "", alternatives: "", retailers: "", tags: "", badge: "", how_to_use: "", conditions: "", source_url: "", published: "false" };
type F = typeof EMPTY;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
const L = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const KV = (s: string) => Object.fromEntries(L(s).map((l) => { const i = l.indexOf(":"); return i < 1 ? null : [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }).filter((x): x is string[] => !!x && !!x[1]));
const J = (a: unknown) => (Array.isArray(a) ? a.join("\n") : "");
const KVs = (o: unknown) => Object.entries((o && typeof o === "object" ? o : {}) as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`).join("\n");

const numOrU = (v: string | undefined) => { const t = (v ?? "").trim().replace(/[₹,\s]/g, ""); if (t === "") return undefined; const n = Number(t); return Number.isFinite(n) ? n : NaN; };
const storeFrom = (url: string) => { try { const h = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  if (/amazon|amzn/.test(h)) return "Amazon"; if (/flipkart|fkrt/.test(h)) return "Flipkart"; if (/myntra/.test(h)) return "Myntra"; if (/ajio/.test(h)) return "Ajio"; if (/nykaa/.test(h)) return "Nykaa"; if (/meesho/.test(h)) return "Meesho";
  const n = h.split(".")[0]; return n.charAt(0).toUpperCase() + n.slice(1); } catch { return "Store"; } };
// Add or replace one store's line in the "Name | link | price | MRP" list.
function upsertRetailer(lines: string, name: string, url: string, price?: number | null, mrp?: number | null) {
  const line = `${name} | ${url}${price != null || mrp != null ? ` | ${price ?? ""}` : ""}${mrp != null ? ` | ${mrp}` : ""}`;
  const all = L(lines); const i = all.findIndex((l) => l.split("|")[0].trim().toLowerCase() === name.toLowerCase());
  if (i >= 0) all[i] = line; else all.push(line); return all.join("\n");
}
// Free "quick fill": reads text copied from a store's product page. No AI, no network.
function parseListing(raw: string) {
  const lines = raw.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean); const text = lines.join("\n");
  const num = (x: string) => Number(x.replace(/,/g, ""));
  const o: { name?: string; brand?: string; price?: number; mrp?: number; rating?: number; reviews?: number; features: string[]; specs: Record<string, string> } = { features: [], specs: {} };
  o.name = lines.find((l) => l.length >= 12 && l.length <= 250 && !/https?:|www\.|\.(com|in)\b|deliver to|search|sign in|^(₹|rs\.?|m\.?r\.?p|visit|brand|about|\d|-?\d+%|deal|limited)/i.test(l))?.slice(0, 200);
  let m = text.match(/Visit the (.+?) Store/i) || text.match(/Brand\s*[:\t]\s*([^\n]+)/i); if (m) o.brand = m[1].trim().slice(0, 60);
  m = text.match(/(?:M\.?R\.?P\.?|List Price|Original Price)\s*[:.]?\s*(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d+)?)/i); if (m) o.mrp = num(m[1]);
  const amts = [...text.matchAll(/(?:₹|Rs\.?\s?)\s*([\d,]+(?:\.\d+)?)/g)].map((x) => num(x[1])).filter((n) => n > 0);
  if (!amts.length) amts.push(...[...text.replace(/[\d,]+\s*(?:global\s+)?(?:ratings?|reviews?)/gi, " ").matchAll(/\b(\d{1,3}(?:,\d{2,3})+(?:\.\d+)?)\b/g)].map((x) => num(x[1])).filter((n) => n >= 10));
  if (amts.length) { o.price = (o.mrp != null ? amts.find((n) => n < o.mrp!) : undefined) ?? amts.find((n) => n !== o.mrp) ?? amts[0];
    if (o.mrp == null) { const hi = Math.max(...amts); if (hi > o.price && /\d+\s*%/.test(text)) o.mrp = hi; } }
  if (o.mrp != null && o.price != null && o.mrp <= o.price) delete o.mrp;
  m = text.match(/(\d(?:\.\d)?)\s*out of 5/i) || text.match(/(\d(?:\.\d)?)\s*★/); if (m && Number(m[1]) <= 5) o.rating = Number(m[1]);
  m = text.match(/([\d,]{1,9})\s*(?:global\s+)?(?:ratings|reviews)/i); if (m) o.reviews = num(m[1]);
  const bullet = (l: string) => l.replace(/^[•\-*·●▪‣]\s*/, "").trim();
  const start = lines.findIndex((l) => /^(about this item|key features|highlights|features|product highlights)\b/i.test(l));
  if (start >= 0) { for (const l of lines.slice(start + 1)) { if (/^(product information|technical details|specifications|customer reviews|from the manufacturer|product description|additional information|ratings|reviews|similar)/i.test(l) || o.features.length >= 8) break;
    const b = bullet(l); if (b.length >= 8 && b.length <= 300) o.features.push(b); } }
  if (!o.features.length) o.features = lines.filter((l) => /^[•\-*·●▪‣]/.test(l)).map(bullet).filter((b) => b.length >= 8 && b.length <= 300).slice(0, 8);
  for (const l of lines) { const mm = l.match(/^([A-Za-z][A-Za-z0-9 /&()\-]{1,40}?)\s*(?::|\t)\s*(.{1,120})$/); if (!mm) continue;
    const k = mm[1].trim(); if (/^(m\.?r\.?p|price|deal|brand|rating|ratings|you save|sold by|delivery|ships from)/i.test(k)) continue;
    if (Object.keys(o.specs).length < 12) o.specs[k] = mm[2].trim(); }
  return o;
}

// Free screenshot reading: OCR runs inside the browser (Tesseract.js), nothing is uploaded to any paid service.
type TessApi = { recognize: (img: File | Blob, lang: string, o?: { logger?: (m: { status: string; progress: number }) => void }) => Promise<{ data: { text: string } }> };
function loadTesseract(): Promise<TessApi> {
  const w = window as unknown as { Tesseract?: TessApi };
  if (w.Tesseract) return Promise.resolve(w.Tesseract);
  return new Promise((res, rej) => {
    const sc = document.createElement("script"); sc.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js"; sc.async = true;
    sc.onload = () => (w.Tesseract ? res(w.Tesseract) : rej(new Error("Screenshot reader failed to load")));
    sc.onerror = () => rej(new Error("Couldn't load the screenshot reader. Check your internet and try again."));
    document.head.appendChild(sc);
  });
}

// Shrinks a screenshot so up to 4 fit in one request.
async function shrink(file: File, maxSide: number, q: number): Promise<string> {
  const bmp = await createImageBitmap(file); const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", q);
}
const withTimeout = <T,>(p: Promise<T>, ms: number, msg: string) => new Promise<T>((res, rej) => { const t = setTimeout(() => rej(new Error(msg)), ms); p.then((v) => { clearTimeout(t); res(v); }, (e) => { clearTimeout(t); rej(e); }); });

function toForm(r: Row): F {
  return { id: r.id, name: r.name, slug: r.slug, brand: r.brand ?? "", category: r.category, subcategory: r.subcategory ?? "", description: r.description ?? "", images: J(r.images),
    rating: r.rating == null ? "" : String(r.rating), review_count: String(r.review_count ?? 0), price: r.price == null ? "" : String(r.price), mrp: r.mrp == null ? "" : String(r.mrp), discount: r.mrp && r.price && r.mrp > r.price ? String(Math.round((1 - r.price / r.mrp) * 100)) : "", features: J(r.features), pros: J(r.pros), limitations: J(r.limitations),
    specifications: KVs(r.specifications), best_for: J(r.best_for), not_ideal_for: J(r.not_ideal_for), verdict_summary: r.verdict_summary ?? "", verdict_scores: KVs(r.verdict_scores),
    alternatives: J(r.alternatives), retailers: (Array.isArray(r.retailers) ? r.retailers : []).map((x: Row) => `${x.name} | ${x.url}${x.price != null || x.mrp != null ? ` | ${x.price ?? ""}` : ""}${x.mrp != null ? ` | ${x.mrp}` : ""}`).join("\n"), tags: J(r.tags), badge: r.badge ?? "", how_to_use: J(r.how_to_use), conditions: J(r.conditions), source_url: r.source_url ?? "", published: String(!!r.published) };
}
function toRow(f: F) {
  const name = f.name.trim(); if (!name) throw new Error("Name is required");
  const slug = slugify(f.slug.trim() || name); if (!slug) throw new Error("Slug is invalid");
  const category = f.category.trim(); if (!category) throw new Error("Category is required");
  const retailers = L(f.retailers).map((l) => { const [n, u, p, m] = l.split("|").map((x) => x.trim()); const url = u ?? "";
    if (!/^https:\/\//i.test(url)) throw new Error(`Store line must look like: Amazon | https://… | 1299 | 1999 (got "${l}")`);
    const price = numOrU(p), mrp = numOrU(m);
    if ((price !== undefined && !(price >= 0)) || (mrp !== undefined && !(mrp >= 0))) throw new Error(`Price and MRP in the store line must be numbers (got "${l}")`);
    if (price !== undefined && mrp !== undefined && mrp < price) throw new Error(`In "${l}" the MRP can't be lower than the price`);
    return { name: n || "Store", url, ...(price !== undefined ? { price } : {}), ...(mrp !== undefined ? { mrp } : {}) }; });
  const images = L(f.images); if (images.some((u) => !/^https:\/\//i.test(u))) throw new Error("Every image URL must start with https://");
  const scores = Object.fromEntries(Object.entries(KV(f.verdict_scores)).map(([k, v]) => { const n = Number(v); if (!(n >= 0 && n <= 5)) throw new Error(`Score "${k}" must be between 0 and 5`); return [k, n]; }));
  const rating = f.rating.trim() === "" ? null : Number(f.rating); if (rating !== null && !(rating >= 0 && rating <= 5)) throw new Error("Rating must be between 0 and 5");
  const lowestStore = retailers.reduce<number | null>((a, r) => (r.price != null && (a == null || r.price < a) ? r.price : a), null);
  const price = f.price.trim() === "" ? lowestStore : Number(f.price); if (price !== null && !(price >= 0)) throw new Error("Price must be 0 or more");
  let mrp = f.mrp.trim() === "" ? null : Number(f.mrp); if (mrp !== null && !(mrp >= 0)) throw new Error("Original price (MRP) must be 0 or more");
  const disc = f.discount.trim() === "" ? null : Number(f.discount); if (disc !== null && !(disc >= 0 && disc < 100)) throw new Error("Discount must be between 0 and 99");
  if (mrp === null && disc !== null && price !== null && disc > 0) mrp = Math.round(price / (1 - disc / 100));
  if (mrp !== null && price !== null && mrp < price) throw new Error("Original price (MRP) can't be lower than the price");
  const src = f.source_url.trim(); if (src && !/^https:\/\//i.test(src)) throw new Error("Source link must start with https://");
  const rc = Number(f.review_count || 0); if (!Number.isInteger(rc) || rc < 0) throw new Error("Review count must be a whole number");
  return { slug, name, brand: f.brand.trim(), category, subcategory: f.subcategory.trim(), description: f.description.trim(), images, rating, review_count: rc, price, mrp, source_url: src || null, currency: "INR",
    features: L(f.features), how_to_use: L(f.how_to_use), conditions: L(f.conditions), pros: L(f.pros), limitations: L(f.limitations), specifications: KV(f.specifications), best_for: L(f.best_for), not_ideal_for: L(f.not_ideal_for),
    verdict_summary: f.verdict_summary.trim(), verdict_scores: scores, alternatives: L(f.alternatives).map(slugify), retailers, tags: L(f.tags.replace(/,/g, "\n")), badge: f.badge || null, published: f.published === "true", price_checked_at: new Date().toISOString() };
}
async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file); const s = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Image compression failed"))), "image/webp", 0.82));
}

const ageDays = (iso?: string) => (iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 864e5)) : 9999);
type Ed = { price: string; mrp: string; stores: { price: string; mrp: string }[] };
// Oldest-checked products first. Update prices in one tap, or confirm "still same".
function PriceRefresh({ rows, reload, say }: { rows: Row[]; reload: () => Promise<void>; say: (m: string) => void }) {
  const [edit, setEdit] = useState<Record<string, Ed>>({}); const [saving, setSaving] = useState(""); const [show, setShow] = useState(10); const [checking, setChecking] = useState(false); const [dead, setDead] = useState<Record<string, number>>({});
  const list = [...rows].sort((a, b) => String(a.price_checked_at || "").localeCompare(String(b.price_checked_at || "")));
  const init = (r: Row): Ed => ({ price: r.price == null ? "" : String(r.price), mrp: r.mrp == null ? "" : String(r.mrp), stores: (Array.isArray(r.retailers) ? r.retailers : []).map((x: Row) => ({ price: x.price == null ? "" : String(x.price), mrp: x.mrp == null ? "" : String(x.mrp) })) });
  const ev = (r: Row) => edit[r.id] ?? init(r);
  const put = (r: Row, fn: (e: Ed) => Ed) => setEdit((m) => ({ ...m, [r.id]: fn(m[r.id] ?? init(r)) }));
  async function save(r: Row, touchOnly: boolean) {
    setSaving(r.id);
    try {
      const now = new Date().toISOString(); let patch: Row = { price_checked_at: now };
      if (!touchOnly) {
        const e = ev(r); const rs: Row[] = Array.isArray(r.retailers) ? r.retailers : [];
        const nr: Row[] = rs.map((x, i) => { const p = numOrU(e.stores[i]?.price), m = numOrU(e.stores[i]?.mrp);
          if ((p !== undefined && !(p >= 0)) || (m !== undefined && !(m >= 0))) throw new Error(`${r.name}: price and MRP must be numbers`);
          if (p !== undefined && m !== undefined && m < p) throw new Error(`${r.name} (${x.name}): MRP can't be lower than the price`);
          const { price: _p, mrp: _m, ...rest } = x; void _p; void _m; return { ...rest, ...(p !== undefined ? { price: p } : {}), ...(m !== undefined ? { mrp: m } : {}) }; });
        const priced = nr.filter((x) => typeof x.price === "number").sort((a, b) => a.price - b.price);
        let price: number | null, mrp: number | null;
        if (priced.length) { price = priced[0].price; mrp = typeof priced[0].mrp === "number" ? priced[0].mrp : null; }
        else { const p = numOrU(e.price), m = numOrU(e.mrp); if ((p !== undefined && !(p >= 0)) || (m !== undefined && !(m >= 0))) throw new Error(`${r.name}: price and MRP must be numbers`); if (p !== undefined && m !== undefined && m < p) throw new Error(`${r.name}: MRP can't be lower than the price`); price = p ?? null; mrp = m ?? null; }
        patch = { ...patch, price, mrp, retailers: nr };
      }
      const { error } = await sb.from(T).update(patch).eq("id", r.id); if (error) throw new Error(error.message);
      setEdit((m) => { const n = { ...m }; delete n[r.id]; return n; }); await reload(); say(`${r.name}: ${touchOnly ? "marked as checked today" : "prices updated"} ✓`);
    } catch (e) { say((e as Error).message); }
    setSaving("");
  }
  async function checkLinks() {
    setChecking(true);
    try {
      const urls = Array.from(new Set(list.slice(0, show).flatMap((r) => (Array.isArray(r.retailers) ? r.retailers : []).map((x: Row) => String(x.url))))).slice(0, 24);
      if (!urls.length) { say("No store links to check in this list."); setChecking(false); return; }
      const tok = (await sb.auth.getSession()).data.session?.access_token;
      const res = await withTimeout(fetch("/api/admin/linkcheck", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: JSON.stringify({ urls }) }), 60000, "The link check took too long. Try again.");
      const j = await res.json(); if (!j.ok) throw new Error(j.error || "Link check failed");
      const rs = j.results as Record<string, number>; setDead((d) => ({ ...d, ...rs }));
      const bad = Object.values(rs).filter((c) => c === 404 || c === 410).length, unk = Object.values(rs).filter((c) => c === 0 || c === 403 || c === 429 || c >= 500).length;
      say(`found ${urls.length} links: ${bad} look removed (404), ${unk} couldn't be verified because the store blocks automatic checks.`);
    } catch (e) { say((e as Error).message); }
    setChecking(false);
  }
  async function draft(r: Row) { const { error } = await sb.from(T).update({ published: false }).eq("id", r.id); await reload(); say(error ? error.message : `${r.name} moved to Draft ✓`); }
  if (!rows.length) return null;
  return (<section className="mt-8"><div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-lg font-semibold">Prices to refresh</h2><p className="text-xs text-muted">Oldest checked first. Open the store, compare, then update or tap &quot;Still same&quot;.</p></div>
    <button onClick={checkLinks} disabled={checking} className="btn-ghost">{checking ? "Checking links…" : "Check links in this list"}</button></div>
    <div className="mt-3 space-y-3">{list.slice(0, show).map((r) => { const e = ev(r); const rs: Row[] = Array.isArray(r.retailers) ? r.retailers : []; const age = ageDays(r.price_checked_at); const gone = rs.some((x) => dead[String(x.url)] === 404 || dead[String(x.url)] === 410);
      return (<div key={r.id} className="rounded-xl border border-line bg-bg p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium">{r.name}</p>
        <span className={`chip ${age > 30 ? "!border-red-300 !text-red-700" : age > 14 ? "!border-gold !text-ink" : ""}`}>{age >= 9999 ? "never checked" : age === 0 ? "checked today" : `checked ${age} day${age === 1 ? "" : "s"} ago`}</span></div>
        {gone && <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-red-700">A store link looks removed (404). <button onClick={() => draft(r)} className="underline">Move to Draft</button></p>}
        <div className="mt-3 space-y-2">{rs.length ? rs.map((x, i) => (<div key={x.url} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:grid-cols-[8rem_1fr_1fr_auto]"><a href={x.url} target="_blank" rel="noopener noreferrer" className="col-span-3 text-sm text-accent sm:col-span-1">{x.name} ↗</a>
          <input inputMode="decimal" aria-label={`${x.name} price`} placeholder="Price ₹" value={e.stores[i]?.price ?? ""} onChange={(ev2) => put(r, (d) => ({ ...d, stores: d.stores.map((s2, k) => (k === i ? { ...s2, price: ev2.target.value } : s2)) }))} className="field" />
          <input inputMode="decimal" aria-label={`${x.name} MRP`} placeholder="MRP ₹" value={e.stores[i]?.mrp ?? ""} onChange={(ev2) => put(r, (d) => ({ ...d, stores: d.stores.map((s2, k) => (k === i ? { ...s2, mrp: ev2.target.value } : s2)) }))} className="field" />
          <span className="text-xs text-muted">{dead[String(x.url)] === 404 || dead[String(x.url)] === 410 ? "404" : dead[String(x.url)] === 200 ? "link ok" : ""}</span></div>))
          : (<div className="grid grid-cols-2 gap-2"><input inputMode="decimal" aria-label="Price" placeholder="Price ₹" value={e.price} onChange={(ev2) => put(r, (d) => ({ ...d, price: ev2.target.value }))} className="field" /><input inputMode="decimal" aria-label="MRP" placeholder="MRP ₹" value={e.mrp} onChange={(ev2) => put(r, (d) => ({ ...d, mrp: ev2.target.value }))} className="field" /></div>)}</div>
        <div className="mt-3 flex gap-2"><button onClick={() => save(r, false)} disabled={saving === r.id} className="btn-primary">{saving === r.id ? "Saving…" : "Update prices"}</button><button onClick={() => save(r, true)} disabled={saving === r.id} className="btn-ghost">Still same ✓</button></div></div>); })}</div>
    {list.length > show && <button onClick={() => setShow((n) => n + 10)} className="btn-ghost mt-3">Show 10 more ({list.length - show} left)</button>}</section>);
}

// ---------- Bulk add: many screenshots, one product each ----------
type Item = { key: string; file: File; status: "queued" | "reading" | "ready" | "failed" | "saved"; err: string; sel: boolean; f: F; store: string; url: string; useShot: boolean };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nn = (v: string) => { const n = numOrU(v); return n !== undefined && Number.isFinite(n) ? n : null; };
function Thumb({ file }: { file: File }) {
  const [u, setU] = useState("");
  useEffect(() => { const x = URL.createObjectURL(file); setU(x); return () => URL.revokeObjectURL(x); }, [file]);
  return u ? <img src={u} alt="Screenshot" className="h-24 w-16 shrink-0 rounded-md border border-line object-cover object-top" /> : <span className="h-24 w-16 shrink-0" />;
}
function BulkAdd({ rows, reload, say, done }: { rows: Row[]; reload: () => Promise<void>; say: (m: string) => void; done: () => void }) {
  const [items, setItems] = useState<Item[]>([]); const [running, setRunning] = useState(false); const [saving, setSaving] = useState(false); const [publish, setPublish] = useState(false);
  const slugs = new Set(rows.map((r) => String(r.slug)));
  const patch = (k: string, p: Partial<Item>) => setItems((a) => a.map((x) => (x.key === k ? { ...x, ...p } : x)));
  const patchF = (k: string, p: Partial<F>) => setItems((a) => a.map((x) => (x.key === k ? { ...x, f: { ...x.f, ...p } } : x)));

  async function readOne(it: Item, tok: string) {
    patch(it.key, { status: "reading", err: "" });
    let img = ""; for (const [side, q] of [[2200, 0.75], [1800, 0.6], [1400, 0.5]] as const) { img = await shrink(it.file, side, q); if (img.length < 2_800_000) break; }
    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await withTimeout(fetch("/api/admin/screenshot", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: JSON.stringify({ images: [img] }) }), 65000, "The AI took too long for this one.");
      const j = await r.json().catch(() => ({}));
      if (j.ok) {
        const d = j.data;
        const f: F = { ...EMPTY, name: d.name, slug: slugify(d.name), brand: d.brand, category: d.category, subcategory: d.subcategory, description: d.description,
          price: d.price != null ? String(d.price) : "", mrp: d.mrp != null ? String(d.mrp) : "", rating: j.rating != null ? String(j.rating) : "", review_count: j.reviews != null ? String(j.reviews) : "0",
          features: d.features.join("\n"), specifications: Object.entries(d.specifications).map(([k, v]) => `${k}: ${v}`).join("\n"), how_to_use: d.how_to_use.join("\n"), conditions: d.conditions.join("\n"), tags: d.tags.join("\n") };
        patch(it.key, { status: "ready", f, store: "", sel: !slugs.has(f.slug) });
        return;
      }
      if (j.code === "no-vision-key") throw new Error("NOKEY");
      if (/429/.test(String(j.error)) && attempt < 2) { await sleep(7000 * (attempt + 1)); continue; }
      throw new Error(j.error || "Couldn't read this screenshot");
    }
  }
  async function start(files: FileList | null) {
    if (!files?.length) return;
    const fresh: Item[] = Array.from(files).slice(0, 20).map((file, i) => ({ key: `${Date.now()}-${i}`, file, status: "queued" as const, err: "", sel: true, f: { ...EMPTY }, store: "", url: "", useShot: false }));
    setItems((a) => [...a, ...fresh]); setRunning(true);
    const tok = (await sb.auth.getSession()).data.session?.access_token || "";
    let idx = 0, stop = false;
    const worker = async () => {
      while (!stop) {
        const it = fresh[idx++]; if (!it) return;
        try { await readOne(it, tok); } catch (e) {
          const m = (e as Error).message;
          if (m === "NOKEY") { stop = true; say("Bulk add needs the free Gemini key (GEMINI_API_KEY in Vercel). Without it screenshots can't be read automatically."); patch(it.key, { status: "failed", err: "No Gemini key set" }); } else patch(it.key, { status: "failed", err: m });
        }
      }
    };
    await Promise.all([worker(), worker()]);
    setItems((a) => a.map((x) => (x.status === "queued" ? { ...x, status: "failed" as const, err: "Skipped" } : x)));
    setRunning(false);
  }
  async function retry(it: Item) { const tok = (await sb.auth.getSession()).data.session?.access_token || ""; try { await readOne(it, tok); } catch (e) { patch(it.key, { status: "failed", err: (e as Error).message === "NOKEY" ? "No Gemini key set" : (e as Error).message }); } }
  async function saveAll() {
    const todo = items.filter((x) => x.sel && x.status === "ready"); if (!todo.length) { say("Select at least one finished product."); return; }
    setSaving(true); const used = new Set(slugs); let ok = 0, fail = 0;
    for (const x of todo) {
      try {
        const url = x.url.trim(); if (publish && !url) throw new Error("Add the store link before publishing");
        const base = slugify(x.f.slug || x.f.name); let slug = base, n = 2; while (used.has(slug)) slug = `${base}-${n++}`; used.add(slug);
        let images = "";
        if (x.useShot) {
          const blob = await compress(x.file); const path = `${slug}/${Date.now()}-0.webp`;
          const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" }); if (error) throw error;
          images = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        }
        const f: F = { ...x.f, slug, images, published: String(publish), retailers: url ? upsertRetailer("", x.store.trim() || storeFrom(url), url, nn(x.f.price), nn(x.f.mrp)) : "" };
        const { error } = await sb.from(T).insert(toRow(f)); if (error) throw new Error(error.message);
        patch(x.key, { status: "saved", err: "" }); ok++;
      } catch (e) { fail++; patch(x.key, { err: (e as Error).message }); }
    }
    setSaving(false); await reload();
    say(`${ok} product${ok === 1 ? "" : "s"} saved ${publish ? "and published" : "as draft"}${fail ? `. ${fail} had a problem, see the red lines.` : " ✓"}`);
    if (ok && !fail) { setItems((a) => a.filter((x) => x.status !== "saved")); done(); }
  }
  const ready = items.filter((x) => x.status === "ready"), picked = ready.filter((x) => x.sel).length, reading = items.filter((x) => x.status === "reading" || x.status === "queued").length;
  return (<section className="mt-6 rounded-xl border border-line bg-bg p-5">
    <h2 className="text-lg font-semibold">Bulk add from screenshots</h2>
    <p className="mt-1 text-sm text-muted">Select many screenshots at once. <b>One screenshot = one product</b> (capture the top of the product page so name, price and MRP are visible). The AI reads each one, you fix anything wrong, paste each store link, then save them all together.</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <label className={`btn-primary cursor-pointer ${running ? "pointer-events-none opacity-50" : ""}`}>Select screenshots (up to 20)<input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { start(e.target.files); e.target.value = ""; }} /></label>
      {running && <span role="status" className="text-xs text-muted">Reading… {reading} left</span>}
      {!!items.length && !running && <button onClick={() => setItems([])} className="btn-ghost">Clear list</button>}</div>
    {!items.length && <p className="mt-6 rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">No screenshots yet. Pick them from your gallery and they will appear here.</p>}
    {!!ready.length && <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-s1 p-3 text-sm">
      <button onClick={() => setItems((a) => a.map((x) => (x.status === "ready" ? { ...x, sel: true } : x)))} className="text-accent">Select all</button>
      <button onClick={() => setItems((a) => a.map((x) => ({ ...x, sel: false })))} className="text-accent">None</button>
      <label className="flex items-center gap-1.5"><input type="radio" checked={!publish} onChange={() => setPublish(false)} />Save as Draft</label>
      <label className="flex items-center gap-1.5"><input type="radio" checked={publish} onChange={() => setPublish(true)} />Publish now</label>
      <button onClick={saveAll} disabled={saving || running || !picked} className="btn-primary ml-auto">{saving ? "Saving…" : `Save ${picked} selected`}</button></div>}
    <ul className="mt-4 space-y-3">{items.map((x) => (<li key={x.key} className={`flex gap-3 rounded-xl border p-3 ${x.err && x.status !== "failed" ? "border-red-300" : "border-line"}`}>
      <Thumb file={x.file} />
      <div className="min-w-0 flex-1 text-sm">
        {(x.status === "queued" || x.status === "reading") && <p className="text-muted">{x.status === "reading" ? "Reading this screenshot…" : "Waiting…"}</p>}
        {x.status === "saved" && <p className="text-accent">Saved ✓ {x.f.name}</p>}
        {x.status === "failed" && <div><p className="text-red-800">Couldn&apos;t read this one: {x.err}</p><div className="mt-1 space-x-3"><button onClick={() => retry(x)} className="text-accent">Try again</button><button onClick={() => setItems((a) => a.filter((y) => y.key !== x.key))} className="text-muted hover:text-ink">Remove</button></div></div>}
        {x.status === "ready" && <>
          <div className="flex items-center gap-2"><input type="checkbox" checked={x.sel} onChange={(e) => patch(x.key, { sel: e.target.checked })} aria-label="Include this product" />
            <input value={x.f.name} onChange={(e) => patchF(x.key, { name: e.target.value, slug: slugify(e.target.value) })} aria-label="Product name" className="field font-medium" />
            <button onClick={() => setItems((a) => a.filter((y) => y.key !== x.key))} aria-label="Remove" className="shrink-0 text-muted hover:text-ink">✕</button></div>
          {slugs.has(slugify(x.f.slug || x.f.name)) && <p className="mt-1 text-xs text-amber-800">A product with this name is already on the site. Saving will add it again with a new link ending (-2).</p>}
          <div className="mt-2 grid gap-2 sm:grid-cols-4">
            <input value={x.f.brand} onChange={(e) => patchF(x.key, { brand: e.target.value })} placeholder="Brand" aria-label="Brand" className="field" />
            <select value={x.f.category} onChange={(e) => patchF(x.key, { category: e.target.value })} aria-label="Category" className="field">{(CATEGORIES.includes(x.f.category) ? CATEGORIES : [x.f.category, ...CATEGORIES]).map((c) => <option key={c}>{c}</option>)}</select>
            <input value={x.f.price} onChange={(e) => patchF(x.key, { price: e.target.value })} placeholder="Price ₹" inputMode="decimal" aria-label="Price" className="field" />
            <input value={x.f.mrp} onChange={(e) => patchF(x.key, { mrp: e.target.value })} placeholder="MRP ₹" inputMode="decimal" aria-label="MRP" className="field" /></div>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_2fr]">
            <input value={x.store} onChange={(e) => patch(x.key, { store: e.target.value })} placeholder="Store (auto from link)" aria-label="Store name" className="field" />
            <input value={x.url} onChange={(e) => patch(x.key, { url: e.target.value })} placeholder="Your store link: https://…" aria-label="Store link" className="field" /></div>
          <label className="mt-2 flex items-center gap-1.5 text-xs text-muted"><input type="checkbox" checked={x.useShot} onChange={(e) => patch(x.key, { useShot: e.target.checked })} />Use this screenshot as the product image (you can replace it later)</label>
          {x.err && <p className="mt-1 text-xs text-red-800">{x.err}</p>}</>}
      </div></li>))}</ul>
    {!!ready.length && <p className="mt-3 text-xs text-muted">Check each price and MRP against your screenshot. Pros, limitations and your verdict can be added later with Edit.</p>}
  </section>);
}

type Sugg = { id: string; created_at: string; url: string; name: string | null; note: string | null; contact: string | null; status: string };
function Suggestions({ items, reload, say, onAdd }: { items: Sugg[]; reload: () => Promise<void>; say: (m: string) => void; onAdd: (s: Sugg) => void }) {
  const [view, setView] = useState<"new" | "all">("new");
  const list = items.filter((x) => view === "all" || x.status === "new");
  async function mark(s: Sugg, status: string) { const { error } = await sb.from("ayushpicks_suggestions").update({ status }).eq("id", s.id); if (error) say(error.message); else await reload(); }
  async function remove(s: Sugg) { if (!confirm("Delete this suggestion?")) return; const { error } = await sb.from("ayushpicks_suggestions").delete().eq("id", s.id); if (error) say(error.message); else { say("Deleted ✓"); await reload(); } }
  return (<section className="mt-6">
    <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">Customer suggestions</h2>
      <div className="ml-auto flex gap-2">{(["new", "all"] as const).map((v) => <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`chip ${view === v ? "!border-accent !text-accent" : ""}`}>{v === "new" ? `New (${items.filter((x) => x.status === "new").length})` : `All (${items.length})`}</button>)}</div></div>
    <p className="mt-1 text-sm text-muted">Links sent from the public Suggest page. Nothing goes live until you add it. Open the link, check the product, then tap Add to start a draft.</p>
    {!list.length ? <p className="mt-6 rounded-xl border border-line bg-s1 p-5 text-sm text-muted">No suggestions here yet.</p> :
      <ul className="mt-4 space-y-3">{list.map((s) => {
        let host = ""; try { host = new URL(s.url).hostname.replace(/^www\./, ""); } catch {}
        return (<li key={s.id} className="rounded-xl border border-line bg-bg p-4 text-sm">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{storeFrom(s.url)}</span>
            {s.status !== "new" && <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">{s.status}</span>}
            <span className="ml-auto text-xs text-muted">{new Date(s.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}</span></div>
          {s.name && <p className="mt-2 font-medium">{s.name}</p>}
          <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 block break-all text-accent underline">{host || s.url} ↗</a>
          {s.note && <p className="mt-2 text-muted">“{s.note}”</p>}
          {s.contact && <p className="mt-1 text-xs text-muted">From: {s.contact}</p>}
          <div className="mt-3 flex flex-wrap gap-3 text-sm"><button onClick={() => onAdd(s)} className="btn-primary !py-1.5">Add as product</button>
            {s.status === "new" && <button onClick={() => mark(s, "rejected")} className="text-muted hover:text-ink">Reject</button>}
            {s.status !== "new" && <button onClick={() => mark(s, "new")} className="text-muted hover:text-ink">Move back to new</button>}
            <button onClick={() => remove(s)} className="text-muted hover:text-ink">Delete</button></div></li>);
      })}</ul>}
  </section>);
}

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null); const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<Row[]>([]); const [f, setF] = useState<F>(EMPTY); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState(""); const [link, setLink] = useState(""); const [sugg, setSugg] = useState<Sugg[]>([]);
  const [qf, setQf] = useState({ store: "", url: "", text: "" }); const [ocr, setOcr] = useState(""); const [scanning, setScanning] = useState(false);
  const [tab, setTab] = useState<"products" | "add" | "bulk" | "prices" | "suggest" | "auto" | "posts">("products"); const [q, setQ] = useState(""); const [st, setSt] = useState<"all" | "published" | "draft">("all"); const [shown, setShown] = useState(30);
  const isAdmin = session?.user.email?.toLowerCase() === ADMIN_EMAIL;
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  const load = useCallback(async () => {
    const { data, error } = await sb.from(T).select("*").order("created_at", { ascending: false });
    if (error) setMsg(error.message); else setRows(data ?? []);
  }, []);
  const loadSugg = useCallback(async () => {
    const { data, error } = await sb.from("ayushpicks_suggestions").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) setMsg(error.message); else setSugg((data ?? []) as Sugg[]);
  }, []);
  useEffect(() => { if (isAdmin) { load(); loadSugg(); } }, [isAdmin, load, loadSugg]);
  const set = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function signIn() {
    setBusy(true); setMsg("");
    const r = pw ? await sb.auth.signInWithPassword({ email: ADMIN_EMAIL, password: pw })
      : await sb.auth.signInWithOtp({ email: ADMIN_EMAIL, options: { shouldCreateUser: true, emailRedirectTo: `${location.origin}/admin` } });
    setMsg(r.error ? r.error.message : pw ? "" : `Sign-in link sent to ${ADMIN_EMAIL}. Open it on this device.`); setBusy(false);
  }
  async function convertLinks() {
    const lines = f.retailers.split("\n"); const todo = lines.map((l, i) => ({ i, p: l.split("|").map((x) => x.trim()) })).filter((x) => /^https:\/\//i.test(x.p[1] ?? "") && !/(^|\.)(clnk\.in|cuelinks\.com)\b/i.test(new URL(x.p[1]).hostname));
    if (!todo.length) { setMsg("Nothing to convert: add lines like  Myntra | https://… first (links already converted are skipped)."); return; }
    setBusy(true); setMsg("");
    try {
      const tok = (await sb.auth.getSession()).data.session?.access_token || "";
      const r = await fetch("/api/admin/cuelinks", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: JSON.stringify({ urls: todo.map((x) => x.p[1]) }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) { setMsg(d.error || "Couldn't convert links."); return; }
      let ok = 0; const errs: string[] = []; const next = [...lines];
      todo.forEach((x, k) => { const res = d.results?.[k]; if (res?.link) { const q = [...x.p]; q[1] = res.link; next[x.i] = q.join(" | "); ok++; } else errs.push(res?.error || "failed"); });
      setF((p) => ({ ...p, retailers: next.join("\n") }));
      setMsg(errs.length ? `${ok} converted ✓, ${errs.length} failed: ${errs[0]}` : `${ok} link${ok === 1 ? "" : "s"} converted to Cuelinks ✓ Save the product to keep them.`);
    } catch { setMsg("Network problem while converting links."); } finally { setBusy(false); }
  }
  async function autofill() {
    const url = link.trim(); if (!/^https:\/\//i.test(url)) { setMsg("Paste a full product link starting with https://"); return; }
    setBusy(true); setMsg("Reading the page and writing a draft. This can take up to a minute…");
    try {
      const tok = (await sb.auth.getSession()).data.session?.access_token;
      const r = await fetch("/api/admin/autofill", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: JSON.stringify({ url }) });
      const j = await r.json(); if (!j.ok) throw new Error(j.error || "Auto-fill failed");
      const d = j.data; const host = new URL(url).hostname.replace(/^www\./, "").split(".")[0]; const store = host.charAt(0).toUpperCase() + host.slice(1);
      setF((p) => ({ ...p, name: d.name || p.name, slug: p.slug || slugify(d.name || ""), brand: d.brand, category: d.category, subcategory: d.subcategory, description: d.description, images: d.image_url || p.images,
        price: d.price != null ? String(d.price) : p.price, mrp: d.mrp != null ? String(d.mrp) : p.mrp, features: d.features.join("\n"), pros: d.pros.join("\n"), limitations: d.limitations.join("\n"),
        specifications: Object.entries(d.specifications).map(([k, v]) => `${k}: ${v}`).join("\n"), how_to_use: d.how_to_use.join("\n"), conditions: d.conditions.join("\n"), best_for: d.best_for.join("\n"),
        not_ideal_for: d.not_ideal_for.join("\n"), tags: d.tags.join("\n"), verdict_summary: d.verdict_summary, source_url: j.sourceUrl, retailers: upsertRetailer(p.retailers, store, url, d.price, d.mrp), published: "false" }));
      setMsg(`${j.note} Swap in your affiliate link if needed, check everything, then save.`);
    } catch (e) { setMsg((e as Error).message); }
    setBusy(false);
  }
  // Fills only empty fields; always updates this store's link and price.
  function applyShot(d: { name: string; brand: string; category: string; subcategory: string; description: string; price: number | null; mrp: number | null; features: string[]; specifications: Record<string, string>; how_to_use: string[]; conditions: string[]; tags: string[] }, rating: number | null, reviews: number | null, url: string, store: string) {
    setF((p) => ({ ...p,
      name: p.name || d.name, slug: p.slug || (p.name ? "" : slugify(d.name)), brand: p.brand || d.brand, subcategory: p.subcategory || d.subcategory, description: p.description || d.description,
      category: p.name ? p.category : d.category, price: p.price || (d.price != null ? String(d.price) : ""), mrp: p.mrp || (d.mrp != null ? String(d.mrp) : ""),
      rating: p.rating || (rating != null ? String(rating) : ""), review_count: p.review_count && p.review_count !== "0" ? p.review_count : reviews != null ? String(reviews) : p.review_count,
      features: p.features || d.features.join("\n"), specifications: p.specifications || Object.entries(d.specifications).map(([k, v]) => `${k}: ${v}`).join("\n"),
      how_to_use: p.how_to_use || d.how_to_use.join("\n"), conditions: p.conditions || d.conditions.join("\n"), tags: p.tags || d.tags.join("\n"),
      retailers: upsertRetailer(p.retailers, store, url, d.price, d.mrp) }));
    setQf((q) => ({ ...q, text: "", url: "", store: "" }));
  }
  async function readShots(files: FileList | null) {
    if (!files?.length) return; const list = Array.from(files).slice(0, 6);
    const url = qf.url.trim(); if (!/^https:\/\//i.test(url)) { setMsg("Paste the store link first (it becomes the Buy button), then add the screenshots."); return; }
    const store = qf.store.trim() || storeFrom(url);
    setScanning(true); setMsg("");
    try {
      // 1) Best: a free Gemini key on the server reads the screenshots like a person would.
      setOcr("Reading your screenshots with AI…");
      let imgs: string[] = [];
      for (const [side, q] of [[2200, 0.75], [1800, 0.6], [1400, 0.5]] as const) { imgs = await Promise.all(list.slice(0, 4).map((x) => shrink(x, side, q))); if (imgs.join("").length < 3_800_000) break; }
      const tok = (await sb.auth.getSession()).data.session?.access_token;
      const r = await withTimeout(fetch("/api/admin/screenshot", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: JSON.stringify({ images: imgs }) }), 70000, "The AI took too long. Try again with fewer screenshots.");
      const j = await r.json().catch(() => ({}));
      if (j.ok) {
        applyShot(j.data, j.rating, j.reviews, url, store);
        setMsg(`${store}: the AI read your screenshots and filled name${j.data.price != null ? `, price ₹${j.data.price}` : ""}${j.data.mrp != null ? `, MRP ₹${j.data.mrp}` : ""}, highlights and specs. Fields that already had a value were kept. Compare price and MRP with your screenshot, add your own pros, limitations and verdict, then save.`);
        return;
      }
      if (j.code !== "no-vision-key") throw new Error(j.error || "Couldn't read the screenshots");
      // 2) No AI key: free OCR in the browser (less accurate).
      setOcr("No AI key set. Using the basic screenshot reader (first time takes a little while)…");
      const tess = await withTimeout(loadTesseract(), 60000, "The basic screenshot reader didn't load. Check your internet.");
      let text = "";
      for (let i = 0; i < list.length; i++) {
        setOcr(`Basic reader: screenshot ${i + 1} of ${list.length}…`);
        const res = await withTimeout(tess.recognize(list[i], "eng", { logger: (m) => { if (m.status === "recognizing text") setOcr(`Basic reader: screenshot ${i + 1} of ${list.length}… ${Math.round(m.progress * 100)}%`); } }), 120000, "Reading a screenshot took too long.");
        text += "\n" + res.data.text;
      }
      quickFill(text, true);
    } catch (e) { setMsg((e as Error).message); }
    setOcr(""); setScanning(false);
  }
  function quickFill(textOverride?: string, fromShot = false) {
    const url = qf.url.trim(); const raw = textOverride ?? qf.text; if (!/^https:\/\//i.test(url)) { setMsg("Paste the store link first (it must start with https://). It becomes the Buy button."); return; }
    if (!raw.trim()) { setMsg("Paste the text you copied from the store's product page."); return; }
    const d = parseListing(raw); const store = qf.store.trim() || storeFrom(url);
    setF((p) => ({ ...p,
      name: p.name || d.name || "", slug: p.slug || (p.name ? "" : slugify(d.name || "")), brand: p.brand || d.brand || "",
      price: p.price || (d.price != null ? String(d.price) : ""), mrp: p.mrp || (d.mrp != null ? String(d.mrp) : ""),
      rating: p.rating, review_count: p.review_count && p.review_count !== "0" ? p.review_count : d.reviews != null ? String(d.reviews) : p.review_count,
      features: p.features || d.features.join("\n"), specifications: p.specifications || Object.entries(d.specs).map(([k, v]) => `${k}: ${v}`).join("\n"),
      retailers: upsertRetailer(p.retailers, store, url, d.price, d.mrp) }));
    const got = [d.name && "name", d.brand && "brand", d.price != null && `price ₹${d.price}`, d.mrp != null && `MRP ₹${d.mrp}`, d.features.length && `${d.features.length} highlights`, Object.keys(d.specs).length && `${Object.keys(d.specs).length} specs`, d.reviews != null && "review count"].filter(Boolean);
    setMsg(`${store}: found ${got.length ? got.join(", ") : "nothing readable. Copy more of the page text"}. Fields that already had a value were kept. ${fromShot ? "Screenshots are read by OCR, which can misread digits. Compare the price, MRP and review count with your screenshot before saving. " : ""}Check everything below, add the image, then save.`);
    setQf((q) => ({ ...q, text: "", url: "", store: "" }));
  }
  async function save() {
    setBusy(true); setMsg("");
    try {
      const row = toRow(f);
      const { error } = f.id ? await sb.from(T).update(row).eq("id", f.id) : await sb.from(T).insert(row);
      if (error) throw new Error(error.message.includes("duplicate") ? "This slug is already used by another product" : error.message);
      setMsg(row.published ? "Saved ✓ It will be live on the site within about a minute." : "Saved as draft ✓ (not visible on the site)."); setF(EMPTY); await load(); setTab("products"); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) { setMsg((e as Error).message); }
    setBusy(false);
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return; const slug = slugify(f.slug || f.name); if (!slug) { setMsg("Type the product name first, then upload images."); return; }
    setBusy(true); setMsg("Compressing and uploading…"); const urls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const blob = await compress(file); const path = `${slug}/${Date.now()}-${urls.length}.webp`;
        const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" }); if (error) throw error;
        urls.push(sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
      }
      setF((p) => ({ ...p, images: [p.images, ...urls].filter(Boolean).join("\n") })); setMsg(`${urls.length} image(s) uploaded as compressed WebP ✓`);
    } catch (e) { setMsg((e as Error).message); }
    setBusy(false);
  }
  async function toggle(r: Row) { const { error } = await sb.from(T).update({ published: !r.published }).eq("id", r.id); setMsg(error ? error.message : ""); load(); }
  async function del(r: Row) { if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return; const { error } = await sb.from(T).delete().eq("id", r.id); setMsg(error ? error.message : "Deleted"); load(); }

  const box = "mx-auto max-w-md rounded-xl border border-line bg-bg p-6";
  if (!ready) return <div className="p-10 text-sm text-muted">Loading…</div>;
  if (!session) return (<div className="px-4 py-20"><div className={box}><h1 className="text-xl font-semibold">AyushPicks Admin</h1>
    <p className="mt-1 text-sm text-muted">Private area. Only {ADMIN_EMAIL} can sign in.</p>
    <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password (leave empty to get an email link)" aria-label="Password" className="field mt-4" />
    <button onClick={signIn} disabled={busy} className="btn-primary mt-3 w-full">{pw ? "Sign in" : "Email me a sign-in link"}</button>
    {msg && <p role="status" className="mt-3 text-sm text-muted">{msg}</p>}</div></div>);
  if (!isAdmin) return (<div className="px-4 py-20"><div className={box}><h1 className="text-xl font-semibold">Access denied</h1>
    <p className="mt-1 text-sm text-muted">This account isn&apos;t allowed to manage AyushPicks.</p><button onClick={() => sb.auth.signOut()} className="btn-ghost mt-4">Sign out</button></div></div>);

  const inp = (k: keyof F, label: string, hint?: string) => (<label className="block text-sm"><span className="font-medium">{label}</span>{hint && <span className="ml-2 text-xs text-muted">{hint}</span>}
    <input value={f[k]} onChange={set(k)} className="field mt-1" /></label>);
  const area = (k: keyof F, label: string, hint?: string, rows = 3) => (<label className="block text-sm"><span className="font-medium">{label}</span>{hint && <span className="ml-2 text-xs text-muted">{hint}</span>}
    <textarea value={f[k]} onChange={set(k)} rows={rows} className="field mt-1 font-mono text-[13px]" /></label>);
  const stale = rows.filter((r) => ageDays(r.price_checked_at) >= 14).length;
  const needle = q.trim().toLowerCase();
  const visible = rows.filter((r) => (st === "all" || (st === "published") === !!r.published) && (!needle || `${r.name} ${r.brand ?? ""} ${r.category}`.toLowerCase().includes(needle)));
  const bad = !!msg && !/^Saved|✓|uploaded|Deleted|Draft created|found|read your screenshots/i.test(msg);
  return (<div className="wrap py-8">
    {msg && <div role="status" aria-live="polite" className={`fixed inset-x-3 bottom-4 z-50 mx-auto flex max-w-xl items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${bad ? "border-red-300 bg-red-50 text-red-900" : "border-accent/30 bg-bg text-ink"}`}><p className="flex-1">{msg}</p><button onClick={() => setMsg("")} aria-label="Dismiss message" className="shrink-0 text-muted hover:text-ink">✕</button></div>}
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold">AyushPicks Admin</h1>
      <div className="flex gap-2"><a href="/" target="_blank" rel="noopener" className="btn-ghost">View site ↗</a><button onClick={() => sb.auth.signOut()} className="btn-ghost">Sign out</button></div></div>
    <nav aria-label="Admin sections" className="sticky top-0 z-30 -mx-4 mt-4 flex gap-2 overflow-x-auto border-b border-line bg-bg/95 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
      {([["products", `Products (${rows.length})`], ["add", f.id ? "Edit product" : "Add product"], ["bulk", "Bulk add"], ["prices", `Prices${stale ? ` (${stale})` : ""}`], ["posts", "Instagram"], ["auto", "Automation"], ["suggest", `Suggestions${sugg.some((x) => x.status === "new") ? ` (${sugg.filter((x) => x.status === "new").length})` : ""}`]] as const).map(([k, label]) => (
        <button key={k} onClick={() => { setTab(k); window.scrollTo({ top: 0 }); }} aria-current={tab === k ? "page" : undefined} className={`${tab === k ? "btn-primary" : "btn-ghost"} shrink-0 !py-2`}>{label}</button>))}
    </nav>
    {tab === "add" && <section className="mt-6 rounded-xl border border-line bg-bg p-5"><h2 className="text-lg font-semibold">{f.id ? "Edit product" : "Add a product"}</h2>
      <details open={!f.id} className="mt-4 rounded-xl border border-accent/30 bg-s1 p-4"><summary className="cursor-pointer text-sm font-medium">Quick fill from copied text or screenshots <span className="ml-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">Free</span></summary>
        <p className="mt-1 text-xs text-muted">Open the product on the store (Amazon, Flipkart…), select all the text on the page, copy and paste it here. Works with no AI key. Use it again with another store&apos;s page to add that store&apos;s link and price to the same product, so shoppers can compare.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_2fr]"><input value={qf.store} onChange={(e) => setQf((q) => ({ ...q, store: e.target.value }))} placeholder="Store name (auto from link)" aria-label="Store name" className="field" />
          <input value={qf.url} onChange={(e) => setQf((q) => ({ ...q, url: e.target.value }))} placeholder="Your link for this store: https://…" aria-label="Store link" className="field" /></div>
        <textarea value={qf.text} onChange={(e) => setQf((q) => ({ ...q, text: e.target.value }))} rows={4} placeholder="Paste the copied page text here" aria-label="Copied page text" className="field mt-2 text-[13px]" />
        <div className="mt-2 flex flex-wrap items-center gap-2"><button onClick={() => quickFill()} disabled={busy || scanning} className="btn-primary">Fill the form</button>
          <label className={`btn-ghost cursor-pointer ${scanning ? "pointer-events-none opacity-50" : ""}`}>Or upload screenshots<input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { readShots(e.target.files); e.target.value = ""; }} /></label>
          {ocr && <span role="status" className="text-xs text-muted">{ocr}</span>}</div>
        <p className="mt-2 text-xs text-muted">Screenshots: upload up to 6 (scroll the page and capture it in parts). With a free Gemini key set in Vercel they are read by AI (accurate). Without it, a basic reader inside your browser is used (less accurate, check every number). Add the store link above first. Have many different products? Use the <b>Bulk add</b> tab.</p></details>
      <details className="mt-4 rounded-xl border border-line bg-s1 p-4"><summary className="cursor-pointer text-sm font-medium">Auto-fill from a link with AI (needs an Anthropic key)</summary><label htmlFor="plink" className="sr-only">Product link</label>
        <p className="mt-1 text-xs text-muted">Paste any product link (Amazon, Flipkart, Myntra, a brand site…). AI writes the details as a draft. You review, add your affiliate link and publish.</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="plink" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.amazon.in/…" className="field" /><button onClick={autofill} disabled={busy} className="btn-primary shrink-0">Auto-fill</button></div></details>
      <h3 className="mt-6 border-t border-line pt-4 text-sm font-semibold">Basics &amp; price</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {inp("name", "Product name *")}{inp("slug", "URL slug", "auto from name, e.g. sony-wh-1000xm5")}
        {inp("brand", "Brand")}
        <label className="block text-sm"><span className="font-medium">Category *</span><select value={f.category} onChange={set("category")} className="field mt-1">{(CATEGORIES.includes(f.category) ? CATEGORIES : [f.category, ...CATEGORIES]).map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
        {inp("subcategory", "Subcategory", "e.g. Headphones")}{inp("price", "Price (₹)", "selling price")}
        {inp("mrp", "Original price / MRP (₹)", "optional")}{inp("discount", "Discount %", "optional; auto if MRP is set")}
        {inp("rating", "AyushPicks rating (0–5)")}{inp("review_count", "Review count", "only real numbers")}
        <label className="block text-sm"><span className="font-medium">Badge</span><select value={f.badge} onChange={set("badge")} className="field mt-1"><option value="">None</option><option>AyushPicks Pick</option><option>Worth Exploring</option></select></label>
        <label className="flex items-center gap-2 text-sm md:mt-6"><input type="checkbox" checked={f.published === "true"} onChange={(e) => setF((p) => ({ ...p, published: String(e.target.checked) }))} /> <span className="font-medium">Published (visible on the site)</span></label>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">{area("description", "Short description", "one or two sentences", 2)}</div>
        <h3 className="mt-2 border-t border-line pt-4 text-sm font-semibold md:col-span-2">Images</h3>
        <div className="md:col-span-2"><label className="block text-sm"><span className="font-medium">Images</span><span className="ml-2 text-xs text-muted">upload (auto-compressed to WebP) or paste https:// URLs, one per line</span>
          <input type="file" accept="image/*" multiple onChange={(e) => { upload(e.target.files); e.target.value = ""; }} className="field mt-1" /></label>
          <textarea value={f.images} onChange={set("images")} rows={3} aria-label="Image URLs" className="field mt-2 font-mono text-[13px]" />
          {L(f.images)[0]?.startsWith("https://") && <img src={L(f.images)[0]} alt="Preview of the first image" className="mt-2 h-24 w-24 rounded-lg border border-line object-contain" />}</div>
        <h3 className="mt-2 border-t border-line pt-4 text-sm font-semibold md:col-span-2">Highlights &amp; specs</h3>
        {area("features", "Key highlights", "one per line", 4)}{area("specifications", "Specifications", "Key: Value, one per line", 4)}
        <h3 className="mt-2 border-t border-line pt-4 text-sm font-semibold md:col-span-2">Pros, limitations &amp; audience</h3>
        {area("pros", "Pros", "one per line")}{area("limitations", "Limitations", "one per line")}
        {area("best_for", "Good for", "one per line")}{area("not_ideal_for", "Not ideal for", "one per line")}
        <h3 className="mt-2 border-t border-line pt-4 text-sm font-semibold md:col-span-2">Usage &amp; terms</h3>
        {area("how_to_use", "How to use / apply", "one step per line", 4)}{area("conditions", "Conditions & terms", "warranty, returns, compatibility…", 4)}
        <h3 className="mt-2 border-t border-line pt-4 text-sm font-semibold md:col-span-2">Verdict &amp; tags</h3>
        <div className="md:col-span-2">{area("verdict_summary", "AyushPicks verdict", "your honest take", 2)}</div>
        {area("verdict_scores", "Verdict scores (0–5)", "Overall: 4.5 · Value: 4 …")}{area("tags", "Tags", "one per line")}
        <h3 className="mt-2 border-t border-line pt-4 text-sm font-semibold md:col-span-2">Stores, links &amp; prices</h3>
        <div className="md:col-span-2">{area("retailers", "Store links & prices *", "Store | https://link | price | MRP, one store per line. Price and MRP are optional. Add several stores to show a price comparison.", 4)}<button type="button" onClick={convertLinks} disabled={busy} className="btn-ghost mt-2">Convert links with Cuelinks</button></div>
        <div className="md:col-span-2">{area("alternatives", "Alternatives", "slugs of other products, one per line", 2)}</div>
        <div className="md:col-span-2">{inp("source_url", "Source link", "optional: where the details came from")}</div>
      </div>
      <div className="mt-5 flex gap-2"><button onClick={save} disabled={busy} className="btn-primary">{busy ? "Saving…" : f.id ? "Save changes" : "Add product"}</button>
        {(f.id || f.name) && <button onClick={() => { setF(EMPTY); setMsg(""); }} className="btn-ghost">Clear form</button>}</div>
    </section>}
    {tab === "bulk" && <BulkAdd rows={rows} reload={load} say={setMsg} done={() => { setTab("products"); window.scrollTo({ top: 0 }); }} />}
    {tab === "suggest" && <Suggestions items={sugg} reload={loadSugg} say={setMsg} onAdd={async (x) => { setF({ ...EMPTY, name: x.name ?? "" }); setLink(x.url); setTab("add"); window.scrollTo({ top: 0 }); setMsg("Link filled in. Tap the quick-fill button to read the product, then save it as a draft ✓"); await sb.from("ayushpicks_suggestions").update({ status: "added" }).eq("id", x.id); loadSugg(); }} />}
    {tab === "posts" && <PostMaker rows={rows} />}
    {tab === "auto" && <AutomationTab say={setMsg} reloadProducts={load} />}
    {tab === "prices" && <PriceRefresh rows={rows} reload={load} say={setMsg} />}
    {tab === "products" && <section className="mt-6">
      <div className="flex flex-wrap items-center gap-2"><h2 className="mr-auto text-lg font-semibold">Products ({visible.length}{visible.length !== rows.length ? ` of ${rows.length}` : ""})</h2>
        <input value={q} onChange={(e) => { setQ(e.target.value); setShown(30); }} placeholder="Search name, brand, category" aria-label="Search products" className="field !w-56" />
        <select value={st} onChange={(e) => { setSt(e.target.value as typeof st); setShown(30); }} aria-label="Filter by status" className="field !w-auto"><option value="all">All</option><option value="published">Published</option><option value="draft">Drafts</option></select></div>
      <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-bg"><table className="w-full min-w-[560px] text-sm"><thead className="text-left text-xs text-muted"><tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Status</th><th className="px-3 py-2" /></tr></thead>
        <tbody>{visible.slice(0, shown).map((r) => (<tr key={r.id} className="border-t border-line"><td className="px-3 py-2">{r.name}</td><td className="px-3 py-2 text-muted">{r.category}</td>
          <td className="px-3 py-2"><button onClick={() => toggle(r)} className={`chip ${r.published ? "!border-accent !text-accent" : ""}`}>{r.published ? "Published" : "Draft"}</button></td>
          <td className="space-x-2 px-3 py-2 text-right"><a href={`/product/${r.slug}`} target="_blank" rel="noopener" className="text-accent">View</a>
            <button onClick={() => { setF(toForm(r)); setTab("add"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-accent">Edit</button><button onClick={() => del(r)} className="text-muted hover:text-ink">Delete</button></td></tr>))}
          {!visible.length && <tr><td colSpan={4} className="px-3 py-8 text-center text-muted">{rows.length ? "No products match." : "No products yet. Use Add product or Bulk add."}</td></tr>}</tbody></table></div>
      {visible.length > shown && <button onClick={() => setShown((n) => n + 30)} className="btn-ghost mt-3">Show 30 more</button>}</section>}
  </div>);
}
