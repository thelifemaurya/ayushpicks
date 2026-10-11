import type { Metadata } from "next";
import { CompareView } from "./CompareView";
export const metadata: Metadata = { title: "Compare Products Side by Side", description: "Compare up to three products on price, rating, key features and limitations, and see which one fits you best.", alternates: { canonical: "/compare" } };
export default function Page() { return <CompareView />; }
