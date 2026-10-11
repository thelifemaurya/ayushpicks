import { INSTAGRAM, SHORT_DESC, SITE } from "@/lib/site";
import { checkedOn, fmtN, sortedOffers } from "@/lib/data";
import { getProducts } from "@/lib/products";
export const revalidate = 3600;
// Longer machine-readable listing of every published product (name, summary, price, page link).
export async function GET() {
  const products = await getProducts();
  const lines = products.map((p) => {
    const offers = sortedOffers(p).filter((o) => o.price != null).map((o) => `${o.name} ${fmtN(o.price!, p.currency)}`).join("; ");
    return `## ${p.name}\n- Page: ${SITE}/product/${p.slug}\n- Category: ${p.category}${p.brand ? `\n- Brand: ${p.brand}` : ""}${p.price != null ? `\n- Listed price: ${fmtN(p.price, p.currency)}${offers ? ` (${offers})` : ""}${checkedOn(p) ? `. ${checkedOn(p)}` : ""}` : ""}\n${p.verdict.summary || p.description ? `- Summary: ${p.verdict.summary || p.description}\n` : ""}${p.pros.length ? `- Pros: ${p.pros.join("; ")}\n` : ""}${p.limitations.length ? `- Limitations: ${p.limitations.join("; ")}\n` : ""}`;
  });
  const body = `# AyushPicks: full product listing\n\n> ${SHORT_DESC}\n\nWebsite: ${SITE}\nInstagram: ${INSTAGRAM}\nPrices change often. Confirm the final price on the retailer's page.\n\n${lines.length ? lines.join("\n") : "Products are being added."}\n`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=3600" } });
}
