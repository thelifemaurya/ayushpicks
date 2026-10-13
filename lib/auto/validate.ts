import { probe } from "@/lib/safe-fetch";
import type { Candidate, Config } from "./core";

export type Verdict = { ok: boolean; reject: boolean; reasons: string[] };
// Hard rejects (broken/invalid) never reach the review queue. Soft issues keep it pending with a reason.
export async function validate(c: Candidate, cfg: Config, opts: { checkLink?: boolean } = {}): Promise<Verdict> {
  const hard: string[] = [], soft: string[] = [];
  if (!c.name || c.name.length < 3) hard.push("Missing product name");
  if (!c.url.startsWith("https://")) hard.push("Link is not https");
  if (!c.category || !cfg.categories.includes(c.category)) soft.push("Category not mapped to your categories");
  if (c.price == null || c.price <= 0) hard.push("Missing or invalid price");
  if (c.price != null && c.mrp != null && c.mrp < c.price) soft.push("MRP lower than price; MRP ignored");
  if (!c.image_url) soft.push("No image URL"); else if (!c.image_permission) hard.push("Image has no usage permission");
  if (c.rating != null && c.rating < cfg.min_rating) hard.push(`Rating ${c.rating} below ${cfg.min_rating}`);
  if (c.rating != null && c.review_count < cfg.min_reviews) soft.push(`Only ${c.review_count} reviews`);
  if (c.rating == null) soft.push("No rating from this source");
  if (opts.checkLink !== false && !hard.length) {
    const s = await probe(c.url);
    if (s === 404 || s === 410) hard.push(`Link returns ${s}`);
    else if (s === 0 || s === 403 || s === 429 || s >= 500) soft.push(`Link could not be verified (status ${s})`);
  }
  if (c.image_url && !hard.length && opts.checkLink !== false) {
    const s = await probe(c.image_url);
    if (s === 404 || s === 410) soft.push("Image URL is broken");
    else if (s === 0) soft.push("Image could not be verified");
  }
  return { ok: !hard.length && !soft.length, reject: hard.length > 0, reasons: [...hard, ...soft] };
}
