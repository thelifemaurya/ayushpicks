import type { Metadata } from "next";
import { Info } from "@/components/Info";
export const metadata: Metadata = { title: "Privacy Policy", description: "How AyushPicks handles your data: what we store, what stays on your device and how retailer links work.", alternates: { canonical: "/privacy" } };
export default function Privacy() {
  return (<Info title="Privacy Policy">
    <p>Last updated: October 2026.</p>
    <h2>What we store</h2>
    <p>Your saved and compared products are kept in your own browser (local storage). They are not sent to us. We don&apos;t ask you to create an account.</p>
    <h2>Retailer links</h2>
    <p>When you click a retailer link you leave AyushPicks. The retailer&apos;s own privacy policy applies there. Some links are affiliate links.</p>
    <h2>Hosting</h2>
    <p>The site is hosted on Vercel and product data is stored with Supabase. These providers may process technical data such as IP addresses to serve pages.</p>
  </Info>);
}
