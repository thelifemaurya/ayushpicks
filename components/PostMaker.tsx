"use client";
import { useEffect, useMemo, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
const W = 1080, H = 1350;
const C = { bg: "#F4E9DB", card: "#FFFFFF", ink: "#3B2A20", muted: "#8A7566", terra: "#B0694A", soft: "#EAD9C6", green: "#3F7A4B", red: "#B4483B" };
const toList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()) : []);
const shortName = (r: Row) => { let n = String(r.name || "").split(/\s[|–—]\s|\s-\s/)[0]; n = n.replace(/\s*\(.*?\)\s*$/, ""); return n.length > 80 ? n.slice(0, 77).trimEnd() + "…" : n; };
// Lowest listed store price (what the site shows first) with its own MRP. Discount only when both are real numbers.
function offer(r: Row) {
  const offs = (Array.isArray(r.retailers) ? r.retailers : []).filter((x: Row) => Number(x?.price) > 0).sort((a: Row, b: Row) => Number(a.price) - Number(b.price));
  const price = Number(offs[0]?.price ?? r.price) || 0, mrp = Number(offs[0]?.mrp ?? r.mrp) || 0;
  const off = price > 0 && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { price, mrp: off >= 5 ? mrp : 0, off: off >= 5 ? off : 0, store: String(offs[0]?.name || "") };
}
const nice = (n: number) => (n >= 100000 ? `${(n / 100000).toFixed(1).replace(/\.0$/, "")}L` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

function fam(v: string, fb: string) { const x = getComputedStyle(document.body).getPropertyValue(v).trim(); return x || fb; }
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, lines: number): string[] {
  const words = text.split(/\s+/), out: string[] = []; let cur = "";
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width <= max) cur = t; else { if (cur) out.push(cur); cur = w; } }
  if (cur) out.push(cur);
  if (out.length > lines) { const keep = out.slice(0, lines); let last = keep[lines - 1]; while (last && ctx.measureText(last + "…").width > max) last = last.slice(0, -1); keep[lines - 1] = last.trimEnd() + "…"; return keep; }
  return out;
}
const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
function load(src: string): Promise<HTMLImageElement | null> { return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }

function frame(ctx: CanvasRenderingContext2D, serif: string, sans: string, logo: HTMLImageElement | null) {
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#F8EFE3"); g.addColorStop(1, "#EFE0CD"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = C.terra; ctx.globalAlpha = 0.35; ctx.lineWidth = 2; rr(ctx, 36, 36, W - 72, H - 72, 28); ctx.stroke(); ctx.globalAlpha = 1;
  if (logo) ctx.drawImage(logo, 64, 64, 64, 64);
  ctx.fillStyle = C.ink; ctx.font = `600 36px ${serif}`; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.fillText("AyushPicks", 144, 98);
  ctx.textAlign = "center"; ctx.fillStyle = C.muted; ctx.font = `500 24px ${sans}`; ctx.fillText("ayushpicks.vercel.app  ·  @ayushpicks", W / 2, H - 70);
}

async function drawSpotlight(canvas: HTMLCanvasElement, r: Row, o: { price: boolean; serif: string; sans: string }, logo: HTMLImageElement | null, imgSrc: string | null) {
  const ctx = canvas.getContext("2d")!; canvas.width = W; canvas.height = H; frame(ctx, o.serif, o.sans, logo);
  const img = imgSrc ? await load(imgSrc) : null;
  // photo card
  const cx = 90, cy = 170, cw = W - 180, ch = 690;
  ctx.save(); ctx.shadowColor = "rgba(59,42,32,.18)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.fillStyle = C.card; rr(ctx, cx, cy, cw, ch, 36); ctx.fill(); ctx.restore();
  if (img) { const s = Math.min((cw - 80) / img.width, (ch - 80) / img.height); const w = img.width * s, h = img.height * s; ctx.drawImage(img, cx + (cw - w) / 2, cy + (ch - h) / 2, w, h); }
  else { ctx.fillStyle = C.soft; rr(ctx, cx + 40, cy + 40, cw - 80, ch - 80, 24); ctx.fill(); ctx.fillStyle = C.terra; ctx.textAlign = "center"; ctx.font = `600 64px ${o.serif}`; ctx.fillText(String(r.brand || "AyushPicks"), W / 2, cy + ch / 2); }
  // badge
  let y = 918; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const tag = String(r.badge || "") || String(r.category || ""); ctx.font = `600 24px ${o.sans}`; const tw = ctx.measureText(tag.toUpperCase()).width + 44;
  ctx.fillStyle = r.badge ? C.terra : C.soft; rr(ctx, 90, y - 34, tw, 48, 24); ctx.fill(); ctx.fillStyle = r.badge ? "#fff" : C.terra; ctx.fillText(tag.toUpperCase(), 112, y - 2);
  if (r.brand) { ctx.fillStyle = C.muted; ctx.font = `600 26px ${o.sans}`; ctx.textAlign = "right"; ctx.fillText(String(r.brand).toUpperCase(), W - 90, y - 2); ctx.textAlign = "left"; }
  // name
  y += 70; ctx.fillStyle = C.ink; ctx.font = `600 58px ${o.serif}`; const lines = wrap(ctx, shortName(r), W - 180, 3);
  for (const l of lines) { ctx.fillText(l, 90, y); y += 70; }
  // rating + price
  y += 6; const rating = Number(r.rating), rc = Number(r.review_count) || 0;
  if (rating > 0) { ctx.fillStyle = "#C9962E"; ctx.font = `600 38px ${o.sans}`; const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating)); ctx.fillText(stars, 90, y);
    const sw = ctx.measureText(stars).width; ctx.fillStyle = C.ink; ctx.font = `500 30px ${o.sans}`; ctx.fillText(`${rating.toFixed(1)}${rc ? `  ·  ${nice(rc)} ratings` : ""}`, 90 + sw + 20, y - 2); }
  const of = offer(r);
  if (o.price && of.price > 0) {
    ctx.textAlign = "right"; ctx.fillStyle = C.terra; ctx.font = `600 50px ${o.sans}`; ctx.fillText(`₹${of.price.toLocaleString("en-IN")}`, W - 90, y + 4);
    if (of.mrp) { const t = `₹${of.mrp.toLocaleString("en-IN")}`; ctx.fillStyle = C.muted; ctx.font = `500 28px ${o.sans}`; const mw = ctx.measureText(t).width; ctx.fillText(t, W - 90, y - 48); ctx.fillRect(W - 90 - mw, y - 58, mw, 2.5); }
    const d = r.price_checked_at ? new Date(r.price_checked_at) : null; ctx.fillStyle = C.muted; ctx.font = `500 21px ${o.sans}`;
    ctx.fillText(`${of.store ? of.store + " · " : ""}price on ${d && !isNaN(+d) ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "listing date"}`, W - 90, y + 38);
    ctx.textAlign = "left";
    if (of.off) { ctx.fillStyle = C.terra; rr(ctx, W - 90 - 258, cy + 28, 230, 70, 35); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `700 36px ${o.sans}`; ctx.textAlign = "center"; ctx.fillText(`${of.off}% OFF`, W - 90 - 143, cy + 75); ctx.textAlign = "left"; }
  }
}

async function drawProsCons(canvas: HTMLCanvasElement, r: Row, o: { serif: string; sans: string }, logo: HTMLImageElement | null) {
  const ctx = canvas.getContext("2d")!; canvas.width = W; canvas.height = H; frame(ctx, o.serif, o.sans, logo);
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 54px ${o.serif}`;
  let y = 210; for (const l of wrap(ctx, shortName(r), W - 180, 2)) { ctx.fillText(l, 90, y); y += 64; }
  const block = (title: string, items: string[], col: string, mark: string, top: number, h: number) => {
    ctx.fillStyle = "rgba(255,255,255,.75)"; rr(ctx, 90, top, W - 180, h, 30); ctx.fill(); ctx.fillStyle = col; ctx.font = `700 28px ${o.sans}`; ctx.fillText(title.toUpperCase(), 130, top + 62);
    let yy = top + 118; ctx.font = `500 33px ${o.sans}`;
    for (const it of items.slice(0, 3)) { ctx.fillStyle = col; ctx.fillText(mark, 130, yy); ctx.fillStyle = C.ink; for (const l of wrap(ctx, it, W - 330, 2)) { ctx.fillText(l, 176, yy); yy += 44; } yy += 14; }
  };
  const pros = toList(r.pros), lim = toList(r.limitations); const top = y + 30;
  block("Pros", pros, C.green, "✓", top, 380); block("Limitations", lim, C.red, "✕", top + 410, 380);
}

export function PostMaker({ rows }: { rows: Row[] }) {
  const [sel, setSel] = useState<string>(""); const [price, setPrice] = useState(true); const [msg, setMsg] = useState("");
  const a = useRef<HTMLCanvasElement>(null), b = useRef<HTMLCanvasElement>(null);
  const list = useMemo(() => rows.filter((x) => x.published), [rows]);
  const r = list.find((x) => x.id === sel) || list[0];
  const hasPC = !!r && toList(r.pros).length > 0 && toList(r.limitations).length > 0;
  useEffect(() => {
    if (!r || !a.current) return; let dead = false;
    (async () => {
      const serifV = fam("--font-display", "Georgia, serif"), sansV = fam("--font-inter", "system-ui, sans-serif");
      try { await Promise.all([document.fonts.load(`600 40px ${serifV}`), document.fonts.load(`500 30px ${sansV}`), document.fonts.load(`700 28px ${sansV}`)]); } catch {}
      const logo = await load("/logo.png"); const first = toList(r.images)[0];
      const src = first && first.startsWith("https://") ? `/_next/image?url=${encodeURIComponent(first)}&w=1080&q=75` : null;
      if (dead || !a.current) return;
      await drawSpotlight(a.current, r, { price, serif: serifV, sans: sansV }, logo, src);
      if (b.current && hasPC) await drawProsCons(b.current, r, { serif: serifV, sans: sansV }, logo);
    })().catch((e) => setMsg(String(e?.message || e)));
    return () => { dead = true; };
  }, [r, price, hasPC]);

  async function save(c: HTMLCanvasElement | null, name: string) {
    if (!c) return;
    const blob: Blob | null = await new Promise((res) => { try { c.toBlob((x) => res(x), "image/png"); } catch { res(null); } });
    if (!blob) { setMsg("Could not export this image. The product photo may be from a site that is not supported yet."); return; }
    const file = new File([blob], `${name}.png`, { type: "image/png" });
    try { const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }; if (nav.canShare?.({ files: [file] })) { await nav.share({ files: [file] }); return; } } catch { /* user closed the share sheet */ return; }
    const u = URL.createObjectURL(file); const l = document.createElement("a"); l.href = u; l.download = file.name; l.click(); setTimeout(() => URL.revokeObjectURL(u), 4000); setMsg("Saved to downloads ✓");
  }
  if (!list.length) return <p className="mt-6 rounded-xl border border-line bg-s1 p-5 text-sm text-muted">Publish a product first.</p>;
  const slug = (r?.slug || "post").slice(0, 40);
  return (<section className="mt-6">
    <h2 className="text-lg font-semibold">Instagram posts</h2>
    <p className="mt-1 text-sm text-muted">Pick a product. You get ready 4:5 images in one theme. Tap Share to send straight to Instagram, or it downloads.</p>
    <select value={r?.id} onChange={(e) => setSel(e.target.value)} className="mt-3 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm">{list.map((x) => <option key={x.id} value={x.id}>{shortName(x).slice(0, 70)}</option>)}</select>
    <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={price} onChange={(e) => setPrice(e.target.checked)} /> Show price and discount <span className="text-xs text-muted">(image shows the price date; prices change, so post soon)</span></label>
    {msg && <p className="mt-2 text-sm text-amber-800">{msg}</p>}
    <div className="mt-4 grid gap-6 sm:grid-cols-2">
      <div><canvas ref={a} className="w-full rounded-xl border border-line" style={{ aspectRatio: "4 / 5" }} /><button onClick={() => save(a.current, `${slug}-1`)} className="btn-primary mt-2 w-full !py-2">Share / save image 1</button></div>
      {hasPC ? <div><canvas ref={b} className="w-full rounded-xl border border-line" style={{ aspectRatio: "4 / 5" }} /><button onClick={() => save(b.current, `${slug}-2`)} className="btn-primary mt-2 w-full !py-2">Share / save image 2</button></div>
        : <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">Pros and limitations slide appears once this product has both. Open Edit product and use the quick-fill button to add them.</p>}
    </div>
  </section>);
}
