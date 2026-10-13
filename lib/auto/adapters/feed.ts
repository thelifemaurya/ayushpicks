import type { Adapter, RawItem } from "./types";
// Generic licensed JSON feed (e.g. an affiliate-network product feed you are approved for).
// Set PRODUCT_FEED_URL (https JSON array) and PRODUCT_FEED_IMAGE_PERMISSION (text describing the image licence).
// Each item: { id, name, brand?, category?, subcategory?, retailer, url, price, mrp?, rating?, reviews?, image?, inStock? }
type FeedItem = { id: string; name: string; brand?: string; category?: string; subcategory?: string; retailer?: string; url: string; price?: number; mrp?: number; rating?: number; reviews?: number; image?: string; inStock?: boolean };
async function load(): Promise<FeedItem[]> {
  const u = process.env.PRODUCT_FEED_URL!; const key = process.env.PRODUCT_FEED_TOKEN;
  const r = await fetch(u, { headers: key ? { authorization: `Bearer ${key}` } : {}, signal: AbortSignal.timeout(25000) });
  if (!r.ok) throw new Error(`Feed ${r.status}`);
  const j = await r.json(); if (!Array.isArray(j)) throw new Error("Feed is not a JSON array"); return j as FeedItem[];
}
export const feed: Adapter = {
  id: "feed", label: "Licensed product feed",
  licence: process.env.PRODUCT_FEED_IMAGE_PERMISSION || "Not configured",
  disabled: () => (process.env.PRODUCT_FEED_URL?.startsWith("https://") && process.env.PRODUCT_FEED_IMAGE_PERMISSION ? null : "Set PRODUCT_FEED_URL and PRODUCT_FEED_IMAGE_PERMISSION (only use a feed whose licence allows it)"),
  async discover(seeds) {
    const cats = seeds.map((s) => s.category); const out: RawItem[] = [];
    for (const f of (await load()).slice(0, 500)) {
      if (!f?.id || !f.name || typeof f.url !== "string" || !f.url.startsWith("https://")) continue;
      const category = cats.includes(f.category || "") ? f.category! : "";
      out.push({ source: "feed", source_id: String(f.id), name: f.name, brand: f.brand || "", category, subcategory: f.subcategory || "", retailer: f.retailer || "", url: f.url, price: typeof f.price === "number" ? f.price : null, mrp: typeof f.mrp === "number" ? f.mrp : null, rating: typeof f.rating === "number" ? f.rating : null, review_count: f.reviews || 0, image_url: f.image?.startsWith("https://") ? f.image : null, image_permission: process.env.PRODUCT_FEED_IMAGE_PERMISSION || null, raw: f });
    }
    return out;
  },
  async lookup(id) {
    const f = (await load()).find((x) => String(x.id) === id); if (!f) return null;
    return { price: typeof f.price === "number" ? f.price : null, mrp: typeof f.mrp === "number" ? f.mrp : null, inStock: f.inStock !== false };
  },
};
