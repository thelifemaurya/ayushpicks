import type { Metadata } from "next";
import { Info } from "@/components/Info";
import { JsonLd } from "@/components/JsonLd";
import { CONTACT_EMAIL, INSTAGRAM, SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Contact AyushPicks", description: "Get in touch with AyushPicks about corrections, product suggestions or partnerships. Email or Instagram.", alternates: { canonical: "/contact" } };
export default function Contact() {
  return (<><JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", url: `${SITE}/contact`, name: "Contact AyushPicks", about: { "@id": `${SITE}/#org` } }} />
    <Info title="Contact">
      <p>Found a mistake, want to suggest a product, or have a partnership idea? We read every message and reply as soon as we can, usually within a few days.</p>
      <h2>Email</h2>
      <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      <h2>Instagram</h2>
      <p><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer me">@ayushpicks</a></p>
      <h2>Corrections</h2>
      <p>If a price, spec or link on a product page looks wrong, email us the product name and what to fix. Prices change often, so please also check the retailer&apos;s page.</p>
    </Info></>);
}
