import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "@/components/Info";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { INSTAGRAM, SHORT_DESC, SITE } from "@/lib/site";
export const metadata: Metadata = { title: "About AyushPicks", description: "AyushPicks (Ayush Picks) is an independent product discovery site from India. Learn how products are picked, how verdicts are written, how prices are checked and how the site earns.", alternates: { canonical: "/about" }, openGraph: { title: "About AyushPicks", description: SHORT_DESC, url: "/about", type: "website" } };
export default function About() {
  return (<><JsonLd data={{ "@context": "https://schema.org", "@type": "AboutPage", url: `${SITE}/about`, name: "About AyushPicks", about: { "@id": `${SITE}/#org` }, isPartOf: { "@id": `${SITE}/#site` } }} /><Info title="About AyushPicks">
    <p><strong>AyushPicks</strong> (also written <em>Ayush Picks</em>) is an independent product discovery and recommendation site from India. Find it on Instagram as <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer me">@ayushpicks</a>.</p>
    <p>AyushPicks helps you work out whether a product is worth buying. We don&apos;t make, stock, sell or ship anything. We explain what a product does, show its strengths and limitations, compare alternatives, and then send you to a retailer if you decide to buy.</p>
    <h2 id="how">How it works</h2>
    <p>Discover products, understand what they offer, compare alternatives, decide with the pros and limitations in front of you, then buy from the retailer. See the <Link href="/#how">five steps</Link> on the home page.</p>
    <h2 id="editorial">Editorial approach</h2>
    <p>We show limitations next to strengths and avoid hype. Our verdicts are our own opinion and we say who a product is good for and who should skip it.</p>
    <h2>How we earn</h2>
    <p>Some retailer links are affiliate links, so we may earn a commission if you buy. This never changes our verdicts or ratings.</p>
    <h2>Prices</h2>
    <p>Each product page shows when its price was last checked. Prices change often, so confirm the final price on the store&apos;s page.</p>
  </Info><Faq /></>);
}
