import type { Adapter, RawItem } from "./types";
// Flipkart Affiliate API. Needs an approved affiliate account: set FLIPKART_AFFILIATE_ID and FLIPKART_AFFILIATE_TOKEN.
// Field names follow Flipkart's published product API; verify against your account's docs before enabling auto-publish.
const BASE = "https://affiliate-api.flipkart.net/affiliate";
const H = () => ({ "Fk-Affiliate-Id": process.env.FLIPKART_AFFILIATE_ID || "", "Fk-Affiliate-Token": process.env.FLIPKART_AFFILIATE_TOKEN || "", accept: "application/json" });
type FkInfo = { productId?: string; title?: string; productBrand?: string; imageUrls?: Record<string, string>; flipkartSellingPrice?: { amount?: number }; flipkartSpecialPrice?: { amount?: number }; maximumRetailPrice?: { amount?: number }; productUrl?: string; inStock?: boolean; categoryPath?: string };
const toItem = (p: FkInfo, category: string): RawItem | null => {
  const id = p.productId, url = p.productUrl, name = p.title; if (!id || !url || !name || !url.startsWith("https://")) return null;
  const price = p.flipkartSpecialPrice?.amount ?? p.flipkartSellingPrice?.amount ?? null;
  const img = p.imageUrls ? (p.imageUrls["800x800"] || p.imageUrls["400x400"] || Object.values(p.imageUrls)[0]) : null;
  return { source: "flipkart", source_id: id, name, brand: p.productBrand || "", category, subcategory: (p.categoryPath || "").split(">").pop()?.trim() || "", retailer: "Flipkart", url, price: price ?? null, mrp: p.maximumRetailPrice?.amount ?? null, rating: null, review_count: 0, image_url: img && img.startsWith("https://") ? img : null, image_permission: "Flipkart affiliate API image (programme terms)", raw: p };
};
export const flipkart: Adapter = {
  id: "flipkart", label: "Flipkart Affiliate API",
  licence: "Product data and images from the Flipkart Affiliate API, used under the affiliate programme terms. Rating/review data is not returned by this API, so rating-based checks are skipped.",
  disabled: () => (process.env.FLIPKART_AFFILIATE_ID && process.env.FLIPKART_AFFILIATE_TOKEN ? null : "Set FLIPKART_AFFILIATE_ID and FLIPKART_AFFILIATE_TOKEN (needs an approved Flipkart affiliate account)"),
  async discover(seeds) {
    const out: RawItem[] = [];
    for (const s of seeds) for (const term of s.terms.slice(0, 3)) {
      const r = await fetch(`${BASE}/1.0/search.json?query=${encodeURIComponent(term)}&resultCount=10`, { headers: H(), signal: AbortSignal.timeout(15000) });
      if (r.status === 429) throw new Error("Flipkart rate limit");
      if (!r.ok) throw new Error(`Flipkart ${r.status}`);
      const j = await r.json() as { products?: { productBaseInfoV1?: FkInfo }[]; productInfoList?: { productBaseInfo?: { productAttributes?: FkInfo } }[] };
      const list = (j.products || []).map((x) => x.productBaseInfoV1).concat((j.productInfoList || []).map((x) => x.productBaseInfo?.productAttributes));
      for (const p of list) { const it = p && toItem(p, s.category); if (it) out.push(it); }
      await new Promise((res) => setTimeout(res, 400));
    }
    return out;
  },
  async lookup(id) {
    const r = await fetch(`${BASE}/1.0/product.json?id=${encodeURIComponent(id)}`, { headers: H(), signal: AbortSignal.timeout(15000) });
    if (r.status === 404) return null; if (!r.ok) throw new Error(`Flipkart ${r.status}`);
    const j = await r.json() as { productBaseInfoV1?: FkInfo }; const p = j.productBaseInfoV1; if (!p) return null;
    return { price: p.flipkartSpecialPrice?.amount ?? p.flipkartSellingPrice?.amount ?? null, mrp: p.maximumRetailPrice?.amount ?? null, inStock: p.inStock !== false };
  },
};
