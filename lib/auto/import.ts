import { slugify } from "@/lib/data";
import { db, type Candidate } from "./core";

export type ImportResult = { action: "inserted" | "updated" | "skipped"; productId?: string; note?: string };

// Idempotent. Never overwrites a manually curated product (curated = true), and never deletes anything.
export async function importCandidate(c: Candidate, publish: boolean): Promise<ImportResult> {
  const found = await db<{ id: string; curated: boolean }[]>(`ayushpicks_products?auto_source=eq.${encodeURIComponent(c.source)}&auto_id=eq.${encodeURIComponent(c.source_id)}&select=id,curated`);
  const now = new Date().toISOString();
  const retailers = [{ name: c.retailer || "Store", url: c.url, ...(c.price != null ? { price: c.price } : {}), ...(c.mrp != null && c.price != null && c.mrp >= c.price ? { mrp: c.mrp } : {}) }];
  if (found[0]) {
    if (found[0].curated) return { action: "skipped", productId: found[0].id, note: "Product is manually curated; not overwritten" };
    await db(`ayushpicks_products?id=eq.${found[0].id}`, { method: "PATCH", body: JSON.stringify({ price: c.price, mrp: c.mrp != null && c.price != null && c.mrp >= c.price ? c.mrp : null, retailers, price_checked_at: now, updated_at: now }) });
    return { action: "updated", productId: found[0].id };
  }
  const slug = `${slugify(c.name).slice(0, 80).replace(/-+$/, "")}-${slugify(c.source_id).slice(-6) || Math.random().toString(36).slice(2, 8)}`;
  const body = {
    slug, name: c.name.slice(0, 200), brand: c.brand.slice(0, 80), category: c.category, subcategory: c.subcategory.slice(0, 80),
    description: `${c.name}${c.brand ? ` by ${c.brand}` : ""}${c.price != null ? `, listed at ₹${c.price.toLocaleString("en-IN")}` : ""}${c.retailer ? ` on ${c.retailer}` : ""}. Details are taken from the retailer listing; check the store page before buying.`,
    images: c.image_url ? [c.image_url] : [], rating: c.rating, review_count: c.review_count, price: c.price,
    mrp: c.mrp != null && c.price != null && c.mrp >= c.price ? c.mrp : null, currency: "INR", retailers, source_url: c.url,
    published: publish, price_checked_at: now, auto_source: c.source, auto_id: c.source_id, curated: false,
    image_permission: c.image_permission, validation_status: publish ? "passed" : "reviewed",
    source_meta: { score: c.score, trend_signal: c.trend_signal, imported_at: now, fail_count: 0 },
  };
  const ins = await db<{ id: string }[]>("ayushpicks_products", { method: "POST", prefer: "return=representation", body: JSON.stringify(body) });
  return { action: "inserted", productId: ins[0]?.id };
}
