import { Product } from "./data";
const STOP = new Set(["i", "need", "for", "a", "the", "best", "under", "with", "and", "to", "of", "in", "good", "great", "products", "product", "useful", "wireless"]);
export function parseQuery(q: string) {
  const m = q.match(/(?:under|below|<)\s*₹?\s*([\d,]+)/i);
  const max = m ? Number(m[1].replace(/,/g, "")) : undefined;
  const terms = q.toLowerCase().replace(m?.[0] ?? "", "").split(/[^a-z0-9]+/).filter((t) => t && !STOP.has(t)).map((t) => t.replace(/s$/, ""));
  return { terms, max };
}
export function search(all: Product[], q: string): Product[] {
  const { terms, max } = parseQuery(q);
  return all.map((p) => {
    const hay = [p.name, p.brand, p.category, p.subcategory, p.description, ...p.tags, ...p.bestFor].join(" ").toLowerCase();
    return { p, hits: terms.filter((t) => hay.includes(t)).length };
  }).filter(({ p, hits }) => (terms.length === 0 || hits > 0) && (max === undefined || (p.price != null && p.price <= max)))
    .sort((a, b) => b.hits - a.hits || b.p.rating - a.p.rating).map((x) => x.p);
}
