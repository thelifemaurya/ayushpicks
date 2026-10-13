import type { Metadata } from "next";
import { SuggestForm } from "./SuggestForm";
export const metadata: Metadata = { title: "Suggest a Product", description: "Know a product worth adding to AyushPicks? Send us the store link and we'll review it.", alternates: { canonical: "/suggest" } };
export default function Page() {
  return (<div className="wrap max-w-xl py-10">
    <h1 className="text-3xl font-semibold tracking-tight">Suggest a product</h1>
    <p className="mt-2 text-sm text-muted">Found something worth a look on Amazon, Flipkart, Myntra, Nykaa or another store? Paste the link and we&apos;ll review it for AyushPicks.</p>
    <SuggestForm />
  </div>);
}
