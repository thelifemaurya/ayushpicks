import type { Candidate } from "./core";
const RELIABLE = ["amazon", "flipkart", "myntra", "nykaa", "ajio", "tata cliq", "croma", "reliance digital"];
// 0..100. Uses only the signals that are actually available (missing ones are skipped, not guessed).
export function score(c: Pick<Candidate, "trend_signal" | "rating" | "review_count" | "price" | "mrp" | "retailer">, linkOk: boolean): number {
  let got = 0, max = 0;
  const add = (pts: number, m: number) => { got += pts; max += m; };
  add(c.trend_signal * 0.25, 25); // search interest alone is a weak signal, so it only carries 25%
  if (c.rating != null) { add(Math.max(0, (c.rating - 3) / 2) * 25, 25); add(Math.min(1, Math.log10(Math.max(c.review_count, 1)) / 4) * 15, 15); }
  if (c.price && c.mrp && c.mrp > c.price) add(Math.min(1, ((c.mrp - c.price) / c.mrp) / 0.5) * 15, 15); else add(0, 15);
  add(RELIABLE.includes(c.retailer.toLowerCase()) ? 10 : 3, 10);
  add(linkOk ? 10 : 0, 10);
  return max ? Math.round((got / max) * 100) : 0;
}
