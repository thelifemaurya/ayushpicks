import { JsonLd } from "./JsonLd";
import { INSTAGRAM, SITE } from "@/lib/site";
// Visible FAQ + matching FAQPage schema. Answers are short and self-contained so search and AI assistants can quote them.
export const FAQ: [string, string][] = [
  ["What is AyushPicks?", "AyushPicks (also written Ayush Picks) is an independent product discovery and recommendation website from India. It explains what a product does, lists its pros and limitations, compares prices across stores and then links you to the retailer."],
  ["Does AyushPicks sell products?", "No. AyushPicks never sells, stocks or ships anything. Every “View at” button opens the retailer's own page, where you complete the purchase."],
  ["How does AyushPicks make money?", "Some retailer links are affiliate links, so AyushPicks may earn a commission if you buy. This does not change the verdicts, ratings or the order of prices."],
  ["How often are prices checked?", "Each product page shows the date the price was last checked. Prices change often, so always confirm the final price on the store's page."],
  ["Where can I follow AyushPicks?", `AyushPicks is on Instagram as @ayushpicks (${INSTAGRAM}).`],
];
export function Faq({ title = "Frequently asked questions" }: { title?: string }) {
  return (<section aria-labelledby="faq-h" className="wrap pt-14">
    <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", "@id": `${SITE}/#faq`, mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }} />
    <h2 id="faq-h" className="mb-4 text-2xl font-semibold tracking-tight">{title}</h2>
    <div className="divide-y divide-line rounded-2xl border border-line bg-s1">{FAQ.map(([q, a]) => (<details key={q} className="group px-5 py-4"><summary className="cursor-pointer list-none text-sm font-medium marker:hidden">{q}</summary><p className="mt-2 text-sm text-muted">{a}</p></details>))}</div>
  </section>);
}
