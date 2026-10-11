import { SB_KEY, SB_URL } from "./site";
import { Product, fromRow } from "./data";
// Server-side read of published products. Cached for 60s (ISR) so new products show up within about a minute.
export async function getProducts(): Promise<Product[]> {
  if (!SB_URL || !SB_KEY) return [];
  try {
    const r = await fetch(`${SB_URL}/rest/v1/ayushpicks_products?select=*&published=eq.true&order=created_at.desc`, { headers: { apikey: SB_KEY }, next: { revalidate: 60 } });
    if (!r.ok) return [];
    return (await r.json()).map(fromRow);
  } catch { return []; }
}
