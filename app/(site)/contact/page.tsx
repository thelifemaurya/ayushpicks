import type { Metadata } from "next";
import { Info } from "@/components/Info";
export const metadata: Metadata = { title: "Contact AyushPicks", description: "Get in touch with AyushPicks about corrections, product suggestions or partnerships.", alternates: { canonical: "/contact" } };
export default function Contact() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (<Info title="Contact">
    <p>Found a mistake, want to suggest a product, or have a partnership idea? We read every message.</p>
    {email ? <p>Email us at <a href={`mailto:${email}`}>{email}</a>.</p> : <p>Contact details will be published here soon.</p>}
  </Info>);
}
