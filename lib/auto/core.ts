// Server-only helpers for the automation pipeline. Never import from client components.
import { SB_URL } from "@/lib/site";

export const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const ready = () => !!(SB_URL && SRK);

export type Config = {
  enabled: boolean; categories: string[]; min_score: number; min_rating: number; min_reviews: number;
  auto_publish_sources: string[]; max_per_category: number; unpublish_after_failures: number; max_price_age_days: number;
};
export const DEFAULT_CONFIG: Config = { enabled: true, categories: [], min_score: 55, min_rating: 4, min_reviews: 50, auto_publish_sources: [], max_per_category: 5, unpublish_after_failures: 2, max_price_age_days: 7 };

export type Candidate = {
  id?: string; source: string; source_id: string; canonical_url: string | null; name: string; brand: string; category: string; subcategory: string;
  retailer: string; url: string; price: number | null; mrp: number | null; rating: number | null; review_count: number; image_url: string | null;
  image_permission: string | null; trend_signal: number; score: number; status: string; reasons: string[]; product_id?: string | null; raw?: unknown;
};

// Service-role REST call. The key stays on the server; it is never sent to the browser.
export async function db<T = unknown>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const { prefer, ...rest } = init;
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...rest, cache: "no-store", signal: AbortSignal.timeout(20000),
    headers: { apikey: SRK, authorization: `Bearer ${SRK}`, "content-type": "application/json", ...(prefer ? { prefer } : {}) },
  });
  if (!r.ok) throw new Error(`DB ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const t = await r.text();
  return (t ? JSON.parse(t) : null) as T;
}

export async function getConfig(): Promise<Config> {
  try {
    const rows = await db<{ value: Partial<Config> }[]>("ayushpicks_settings?key=eq.config&select=value");
    return { ...DEFAULT_CONFIG, ...(rows[0]?.value || {}) };
  } catch { return DEFAULT_CONFIG; }
}

export async function retry<T>(fn: () => Promise<T>, tries = 3, base = 600): Promise<T> {
  let err: unknown;
  for (let i = 0; i < tries; i++) { try { return await fn(); } catch (e) { err = e; await sleep(base * 2 ** i); } }
  throw err;
}
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Canonical form of a product link, used for duplicate detection.
export function canon(raw: string): string | null {
  try {
    const u = new URL(raw); if (u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const asin = u.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1];
    if (asin) return `${host}/dp/${asin.toUpperCase()}`;
    const keep = ["pid"].map((k) => (u.searchParams.get(k) ? `${k}=${u.searchParams.get(k)}` : "")).filter(Boolean).join("&");
    return `${host}${u.pathname.replace(/\/+$/, "")}${keep ? "?" + keep : ""}`;
  } catch { return null; }
}

export async function alert(text: string) {
  const url = process.env.ALERT_WEBHOOK_URL; if (!url || !url.startsWith("https://")) return;
  try { await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, content: text }), signal: AbortSignal.timeout(8000) }); } catch {}
}
