import type { Metadata } from "next";
import { Info } from "@/components/Info";
import { CONTACT_EMAIL } from "@/lib/site";
export const metadata: Metadata = { title: "Privacy Policy", description: "How AyushPicks handles your data: what stays on your device, cookies and advertising, affiliate links and third-party services.", alternates: { canonical: "/privacy" } };
export default function Privacy() {
  return (<Info title="Privacy Policy">
    <p>Last updated: October 2026.</p>
    <p>AyushPicks (the &ldquo;site&rdquo;) is a product discovery and recommendation website. This page explains what information is handled when you use it.</p>
    <h2>What we store</h2>
    <p>Your saved and compared products are kept in your own browser (local storage). They are not sent to us. We don&apos;t ask you to create an account and we don&apos;t collect your name, phone number or address through the site.</p>
    <h2>Messages you send us</h2>
    <p>If you email us, we keep the message and your email address only to reply and to make corrections. If you use the on-site assistant, your messages are processed to produce an answer and are not used to identify you.</p>
    <h2>Cookies and advertising</h2>
    <p>The site may show ads served by Google AdSense. Google and other third-party vendors use cookies, including advertising cookies, to serve ads based on your previous visits to this and other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and other sites on the internet.</p>
    <p>You can opt out of personalised advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. You can also opt out of some third-party vendors&apos; use of cookies for personalised advertising at <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>. To learn how Google uses data from sites that use its services, see <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>.</p>
    <p>You can also block or delete cookies in your browser settings. The site still works without them.</p>
    <h2>Affiliate links</h2>
    <p>When you click a retailer link you leave AyushPicks. The retailer&apos;s own privacy policy applies there. Some links are affiliate links, so the retailer or an affiliate network may set cookies to record that you came from AyushPicks, and we may earn a commission if you buy. It does not change the price you pay.</p>
    <h2>Hosting and technical data</h2>
    <p>The site is hosted on Vercel and product data is stored with Supabase. These providers may process technical data such as IP addresses, browser type and pages visited to serve pages securely and keep the site running.</p>
    <h2>Children</h2>
    <p>The site is not directed at children under 13 and we do not knowingly collect personal information from them.</p>
    <h2>Changes and contact</h2>
    <p>We may update this policy and will change the date above when we do. Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
  </Info>);
}
