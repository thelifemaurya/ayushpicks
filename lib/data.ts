export type Retailer = { name: string; url: string; price?: number; mrp?: number };
export interface Product {
  id: string; slug: string; name: string; brand: string; category: string; subcategory: string;
  description: string; images: string[]; rating: number; reviewCount: number; price: number | null; currency: string; mrp: number | null;
  howToUse: string[]; conditions: string[]; sourceUrl?: string;
  features: string[]; pros: string[]; limitations: string[]; specifications: Record<string, string>;
  bestFor: string[]; notIdealFor: string[];
  verdict: { summary: string; scores: Record<string, number> };
  alternatives: string[]; // product slugs
  retailers: Retailer[]; tags: string[]; badge?: "AyushPicks Pick" | "Worth Exploring"; updatedAt?: string; priceCheckedAt?: string;
}
export const CATEGORIES = ["Tech & Gadgets", "Gaming", "Audio", "Beauty & Skincare", "Fashion", "Lifestyle", "Home & Room", "Student Essentials", "Travel", "Useful Finds"];
export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
export const clip = (s: string, n = 155) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
const money = (n: number, c: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
export const fmtN = (n: number, c = "INR") => money(n, c);
export const fmt = (p: Product) => (p.price == null ? "" : money(p.price, p.currency));
export const fmtMrp = (p: Product) => (p.mrp != null && p.price != null && p.mrp > p.price ? money(p.mrp, p.currency) : "");
export const discountPct = (p: Product) => (p.mrp != null && p.price != null && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0);
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const rec = (v: unknown): Record<string, string> => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, String(x)])) : {});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromRow(r: any): Product {
  const scores = Object.fromEntries(Object.entries(r.verdict_scores && typeof r.verdict_scores === "object" ? r.verdict_scores : {}).map(([k, v]) => [k, Number(v) || 0]));
  return {
    id: r.id, slug: r.slug, name: r.name, brand: r.brand ?? "", category: r.category, subcategory: r.subcategory ?? "",
    description: r.description ?? "", images: arr(r.images).filter((u) => u.startsWith("https://")),
    rating: Number(r.rating) || 0, reviewCount: Number(r.review_count) || 0, price: r.price == null ? null : Number(r.price), mrp: r.mrp == null ? null : Number(r.mrp), currency: r.currency || "INR",
    howToUse: arr(r.how_to_use), conditions: arr(r.conditions), sourceUrl: typeof r.source_url === "string" ? r.source_url : undefined,
    features: arr(r.features), pros: arr(r.pros), limitations: arr(r.limitations), specifications: rec(r.specifications),
    bestFor: arr(r.best_for), notIdealFor: arr(r.not_ideal_for), verdict: { summary: r.verdict_summary ?? "", scores },
    alternatives: arr(r.alternatives),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retailers: (Array.isArray(r.retailers) ? r.retailers : []).filter((x: any) => x && typeof x.url === "string" && x.url.startsWith("https://")).map((x: any) => { const pr = x.price == null || x.price === "" ? NaN : Number(x.price), mr = x.mrp == null || x.mrp === "" ? NaN : Number(x.mrp);
      return { name: String(x.name || "Retailer"), url: x.url, ...(pr >= 0 ? { price: pr } : {}), ...(mr >= 0 ? { mrp: mr } : {}) }; }),
    tags: arr(r.tags), badge: r.badge === "AyushPicks Pick" || r.badge === "Worth Exploring" ? r.badge : undefined, updatedAt: r.updated_at, priceCheckedAt: typeof r.price_checked_at === "string" ? r.price_checked_at : undefined,
  };
}

// Retailers sorted cheapest first (unpriced ones keep their order at the end).
export const sortedOffers = (p: Product): Retailer[] => [...p.retailers].sort((a, b) => (a.price ?? 1e15) - (b.price ?? 1e15));

// "Prices checked 8 Oct 2026" (empty if unknown).
export const checkedOn = (p: Product) => { if (!p.priceCheckedAt) return ""; const d = new Date(p.priceCheckedAt); return Number.isNaN(d.getTime()) ? "" : `Price checked ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}.`; };

// Store filter helpers: "Amazon India", "amazon.in" and "Amazon" all count as one store.
export const storeKey = (n: string) => n.toLowerCase().replace(/\.(in|com|co\.in)\b/g, "").trim().split(/[^a-z0-9]+/)[0] || "";
export const hasStore = (p: Product, key: string) => p.retailers.some((r) => storeKey(r.name) === key);
export function storesOf(ps: Product[]): { key: string; label: string; count: number }[] {
  const m = new Map<string, { key: string; label: string; count: number }>();
  for (const p of ps) for (const k of new Set(p.retailers.map((r) => storeKey(r.name)).filter(Boolean))) {
    const e = m.get(k); if (e) e.count++; else { const raw = p.retailers.find((r) => storeKey(r.name) === k)!.name.trim().split(/[^A-Za-z0-9]+/)[0]; m.set(k, { key: k, label: raw.charAt(0).toUpperCase() + raw.slice(1), count: 1 }); }
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}
// Store name from a product link (used to prefill the admin form).
export function storeFromUrl(u: string): string {
  try { const h = new URL(u).hostname.replace(/^www\./, "").toLowerCase();
    if (/(^|\.)(amazon\.|amzn\.)/.test(h)) return "Amazon"; if (/(flipkart\.|fkrt\.)/.test(h)) return "Flipkart"; if (/myntra\./.test(h)) return "Myntra";
    if (/nykaa\./.test(h)) return "Nykaa"; if (/ajio\./.test(h)) return "Ajio"; if (/meesho\./.test(h)) return "Meesho";
    const w = h.split(".")[0]; return w.charAt(0).toUpperCase() + w.slice(1);
  } catch { return "Store"; }
}
