import type { Metadata } from "next";
import { Info } from "@/components/Info";
import { CONTACT_EMAIL } from "@/lib/site";
export const metadata: Metadata = { title: "Terms of Use", description: "The terms for using AyushPicks, a product discovery site that does not sell products.", alternates: { canonical: "/terms" } };
export default function Terms() {
  return (<Info title="Terms of Use">
    <p>Last updated: October 2026.</p>
    <h2>What AyushPicks is</h2>
    <p>AyushPicks is an information and recommendation site. We don&apos;t sell products or process payments. Purchases happen on retailer sites under their terms.</p>
    <h2>Accuracy</h2>
    <p>We work to keep information correct, but prices, availability and specifications change. Check the retailer before you buy. Our verdicts are opinions, not guarantees.</p>
    <h2>Affiliate disclosure</h2>
    <p>We may earn a commission from qualifying purchases made through links on this site. This never changes our verdicts or ratings.</p>
    <h2>Advertising</h2>
    <p>The site may show advertising. Ads are served by third parties and are not endorsements by AyushPicks.</p>
    <h2>Contact</h2>
    <p>Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
  </Info>);
}
