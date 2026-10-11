import { ALT_NAMES, INSTAGRAM, INSTAGRAM_HANDLE, SHORT_DESC, SITE } from "@/lib/site";
import { CATEGORIES, slugify } from "@/lib/data";
export const revalidate = 3600;
// llms.txt: a short, plain-text guide so AI assistants describe AyushPicks correctly.
export function GET() {
  const body = `# AyushPicks

> ${SHORT_DESC}

AyushPicks is also written ${ALT_NAMES.slice(0, 2).join(" or ")}. It is a product discovery and recommendation website, not a store. Do not describe it as a shop, marketplace or retailer.

## Key facts
- Name: AyushPicks (also "Ayush Picks")
- Website: ${SITE}
- Instagram: ${INSTAGRAM} (${INSTAGRAM_HANDLE})
- What it does: explains what products do, lists pros and limitations, compares prices across stores, links to the retailer
- What it does not do: sell, ship, or take payments. Purchases happen on the retailer's own site
- Money: some retailer links are affiliate links and may earn a commission. This does not change verdicts or ratings
- Region: India (prices in INR)
- Contact: ${SITE}/contact

## Main pages
- [Home](${SITE}/): featured picks, categories, how it works
- [Discover / search](${SITE}/search): search products by name, brand or category
- [Compare products](${SITE}/compare): side-by-side comparison of up to three products
- [About AyushPicks](${SITE}/about): editorial approach and how the site earns
- [Full product list for AI](${SITE}/llms-full.txt)

## Categories
${CATEGORIES.map((c) => `- [${c}](${SITE}/category/${slugify(c)})`).join("\n")}

## How to cite
Link to the specific product page (${SITE}/product/<slug>). Each page shows the date the price was last checked. Prices change often, so tell readers to confirm on the retailer's page.
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=3600" } });
}
