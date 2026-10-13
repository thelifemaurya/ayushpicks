import { probe } from "@/lib/safe-fetch";
import { ADAPTERS, adapterById } from "./adapters";
import { fetchTrends, trendSignal, type Trend } from "./adapters/trends";
import { alert, canon, db, getConfig, ready, retry, sleep, type Candidate, type Config } from "./core";
import { importCandidate } from "./import";
import { score } from "./score";
import { validate } from "./validate";

const SEEDS: Record<string, string[]> = {
  "Tech & Gadgets": ["smartwatch", "power bank", "wireless charger"], Gaming: ["gaming mouse", "gaming headset"], Audio: ["bluetooth earbuds", "bluetooth speaker"],
  "Beauty & Skincare": ["sunscreen", "face serum", "lip balm"], Fashion: ["sneakers", "backpack", "sunglasses"], Lifestyle: ["water bottle", "journal"],
  "Home & Room": ["led strip lights", "desk lamp"], "Student Essentials": ["study lamp", "laptop stand"], Travel: ["travel organiser", "neck pillow"], "Useful Finds": ["cable organiser", "mini trimmer"],
};

type Stats = Record<string, number | string | string[]>;
const inc = (s: Stats, k: string) => { s[k] = (Number(s[k]) || 0) + 1; };
async function startJob(kind: "discover" | "monitor", trigger: string): Promise<string | null> {
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const running = await db<{ id: string }[]>(`ayushpicks_jobs?kind=eq.${kind}&status=eq.running&started_at=gte.${since}&select=id&limit=1`);
  if (running.length) return null; // another run is in progress
  await db(`ayushpicks_jobs?status=eq.running&started_at=lt.${since}`, { method: "PATCH", body: JSON.stringify({ status: "failed", error: "Timed out", finished_at: new Date().toISOString() }) });
  const j = await db<{ id: string }[]>("ayushpicks_jobs", { method: "POST", prefer: "return=representation", body: JSON.stringify({ kind, trigger }) });
  return j[0].id;
}
async function endJob(id: string, status: "ok" | "partial" | "failed", stats: Stats, error?: string) {
  await db(`ayushpicks_jobs?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status, stats, error: error ?? null, finished_at: new Date().toISOString() }) });
  if (status !== "ok") await alert(`AyushPicks automation ${status}: ${error || JSON.stringify(stats)}`);
}

export async function runDiscover(trigger = "cron"): Promise<{ ok: boolean; skipped?: string; stats?: Stats; error?: string }> {
  if (!ready()) return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set" };
  const jobId = await startJob("discover", trigger); if (!jobId) return { ok: true, skipped: "A discovery run is already in progress" };
  const stats: Stats = { discovered: 0, duplicates: 0, rejected: 0, pending: 0, imported: 0, updated: 0, below_threshold: 0, sources: [], notes: [] };
  const notes = stats.notes as string[]; let partial = false;
  try {
    const cfg = await getConfig(); if (!cfg.enabled) { await endJob(jobId, "ok", { ...stats, notes: ["Automation is switched off in settings"] }); return { ok: true, skipped: "Automation is off" }; }
    let trends: Trend[] = []; try { trends = await retry(fetchTrends, 2); stats.trend_terms = trends.length; } catch (e) { notes.push(`Trends unavailable: ${(e as Error).message}`); partial = true; }
    const seeds = cfg.categories.map((category) => ({ category, terms: SEEDS[category] || [] })).filter((s) => s.terms.length);
    const raws: Awaited<ReturnType<(typeof ADAPTERS)[number]["discover"]>> = [];
    for (const a of ADAPTERS) {
      const off = a.disabled(); if (off) { notes.push(`${a.label}: off (${off})`); continue; }
      try { const items = await retry(() => a.discover(seeds), 3); raws.push(...items); (stats.sources as string[]).push(`${a.id}:${items.length}`); } catch (e) { partial = true; notes.push(`${a.label} failed: ${(e as Error).message}`); }
    }
    stats.discovered = raws.length;
    if (!raws.length) { notes.push("No licensed source is connected, so nothing was imported. Nothing is invented."); await endJob(jobId, partial ? "partial" : "ok", stats); return { ok: true, stats }; }

    const prods = await db<{ retailers: { url: string }[]; auto_source: string | null; auto_id: string | null }[]>("ayushpicks_products?select=retailers,auto_source,auto_id&limit=5000");
    const have = new Set<string>(); for (const p of prods) for (const r of p.retailers || []) { const k = canon(r.url); if (k) have.add(k); }
    const cands = await db<{ id: string; source: string; source_id: string; status: string }[]>("ayushpicks_candidates?select=id,source,source_id,status&limit=10000");
    const known = new Map(cands.map((c) => [`${c.source}|${c.source_id}`, c]));
    const seen = new Set<string>(); const fresh: Candidate[] = [];
    for (const r of raws.slice(0, 120)) {
      const key = `${r.source}|${r.source_id}`; const ck = canon(r.url);
      if (seen.has(key) || (ck && seen.has(ck))) { inc(stats, "duplicates"); continue; } seen.add(key); if (ck) seen.add(ck);
      const prev = known.get(key);
      if (!prev && ck && have.has(ck)) { inc(stats, "duplicates"); continue; } // already on the site
      const sig = trendSignal(`${r.name} ${r.brand} ${r.category}`, trends);
      const base: Candidate = { ...r, canonical_url: ck, trend_signal: sig, score: 0, status: "pending", reasons: [] };
      if (prev && prev.status !== "pending") continue; // decisions already made are respected
      const v = await validate(base, cfg); await sleep(150);
      base.score = score(base, !v.reasons.some((x) => x.startsWith("Link")));
      base.reasons = v.reasons; base.status = v.reject ? "rejected" : "pending";
      if (prev) base.id = prev.id;
      fresh.push(base);
    }
    // Keep the best few per category; everything else is skipped (not stored) so it can resurface later.
    const keep: Candidate[] = []; const perCat = new Map<string, number>();
    for (const c of fresh.sort((a, b) => b.score - a.score)) {
      if (c.status === "rejected") { keep.push(c); inc(stats, "rejected"); continue; }
      const n = perCat.get(c.category) || 0;
      if (c.score < cfg.min_score || n >= cfg.max_per_category) { inc(stats, "below_threshold"); continue; }
      perCat.set(c.category, n + 1); keep.push(c);
    }
    for (const c of keep) {
      try {
        const row = { source: c.source, source_id: c.source_id, canonical_url: c.canonical_url, name: c.name, brand: c.brand, category: c.category, subcategory: c.subcategory, retailer: c.retailer, url: c.url, price: c.price, mrp: c.mrp, rating: c.rating, review_count: c.review_count, image_url: c.image_url, image_permission: c.image_permission, trend_signal: c.trend_signal, score: c.score, status: c.status, reasons: c.reasons, raw: c.raw ?? {}, last_checked: new Date().toISOString() };
        let id = c.id;
        if (id) await db(`ayushpicks_candidates?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(row) });
        else { const ins = await db<{ id: string }[]>("ayushpicks_candidates?on_conflict=source,source_id", { method: "POST", prefer: "return=representation,resolution=ignore-duplicates", body: JSON.stringify(row) }); id = ins[0]?.id; }
        if (c.status === "pending") {
          const auto = cfg.auto_publish_sources.includes(c.source) && c.reasons.length === 0 && c.score >= cfg.min_score && c.category;
          if (auto && id) { const res = await importCandidate(c, true); await db(`ayushpicks_candidates?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status: res.action === "skipped" ? "rejected" : "imported", product_id: res.productId ?? null, reasons: res.note ? [res.note] : [] }) }); inc(stats, res.action === "updated" ? "updated" : "imported"); }
          else inc(stats, "pending");
        }
      } catch (e) { partial = true; notes.push(`Save failed for "${c.name.slice(0, 40)}": ${(e as Error).message}`); }
    }
    await endJob(jobId, partial ? "partial" : "ok", stats); return { ok: true, stats };
  } catch (e) { const msg = (e as Error).message; await endJob(jobId, "failed", stats, msg).catch(() => {}); return { ok: false, error: msg, stats }; }
}

export async function runMonitor(trigger = "cron"): Promise<{ ok: boolean; skipped?: string; stats?: Stats; error?: string }> {
  if (!ready()) return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set" };
  const jobId = await startJob("monitor", trigger); if (!jobId) return { ok: true, skipped: "A monitor run is already in progress" };
  const stats: Stats = { checked: 0, price_updated: 0, unavailable: 0, unpublished: 0, restored: 0, stale_curated: 0, notes: [] };
  const notes = stats.notes as string[]; let partial = false;
  try {
    const cfg: Config = await getConfig();
    type P = { id: string; auto_source: string; auto_id: string; retailers: { name: string; url: string; price?: number; mrp?: number }[]; published: boolean; price: number | null; source_meta: Record<string, unknown> | null };
    const auto = await db<P[]>("ayushpicks_products?curated=eq.false&auto_source=not.is.null&select=id,auto_source,auto_id,retailers,published,price,source_meta&limit=300");
    for (const p of auto) {
      inc(stats, "checked");
      try {
        const a = adapterById(p.auto_source); let gone = false; let upd: { price: number | null; mrp: number | null } | null = null;
        if (a && !a.disabled()) { const r = await retry(() => a.lookup(p.auto_id), 2); if (!r || !r.inStock) gone = true; else upd = r; }
        else { const s = await probe(p.retailers?.[0]?.url || ""); if (s === 404 || s === 410) gone = true; }
        const meta = { ...(p.source_meta || {}) }; const fails = gone ? Number(meta.fail_count || 0) + 1 : 0; meta.fail_count = fails;
        const patch: Record<string, unknown> = { source_meta: meta, updated_at: new Date().toISOString() };
        if (upd && upd.price != null && upd.price > 0) {
          patch.price = upd.price; patch.mrp = upd.mrp != null && upd.mrp >= upd.price ? upd.mrp : null; patch.price_checked_at = new Date().toISOString();
          patch.retailers = (p.retailers || []).map((r, i) => (i === 0 ? { ...r, price: upd!.price, ...(patch.mrp ? { mrp: patch.mrp } : {}) } : r));
          if (upd.price !== p.price) inc(stats, "price_updated");
        }
        if (gone) { inc(stats, "unavailable"); if (!p.published) patch.unavailable_since = new Date().toISOString(); }
        if (gone && fails >= cfg.unpublish_after_failures && p.published) { patch.published = false; patch.unavailable_since = new Date().toISOString(); meta.auto_unpublished = true; inc(stats, "unpublished"); await db(`ayushpicks_candidates?product_id=eq.${p.id}`, { method: "PATCH", body: JSON.stringify({ status: "unavailable" }) }); }
        if (!gone && meta.auto_unpublished) { patch.published = true; patch.unavailable_since = null; delete meta.auto_unpublished; inc(stats, "restored"); }
        await db(`ayushpicks_products?id=eq.${p.id}`, { method: "PATCH", body: JSON.stringify(patch) }); await sleep(250);
      } catch (e) { partial = true; notes.push(`Check failed for ${p.id.slice(0, 8)}: ${(e as Error).message}`); }
    }
    const old = new Date(Date.now() - cfg.max_price_age_days * 864e5).toISOString();
    const cur = await db<{ id: string }[]>(`ayushpicks_products?curated=eq.true&published=eq.true&price_checked_at=lt.${old}&select=id&limit=1000`);
    stats.stale_curated = cur.length; // curated prices are never changed automatically; the admin Prices tab handles them
    await endJob(jobId, partial ? "partial" : "ok", stats); return { ok: true, stats };
  } catch (e) { const msg = (e as Error).message; await endJob(jobId, "failed", stats, msg).catch(() => {}); return { ok: false, error: msg, stats }; }
}
