import type { Metadata } from "next";
import { SavedView } from "./SavedView";
export const metadata: Metadata = { title: "Saved Products", description: "Products you saved on AyushPicks to revisit or compare later.", alternates: { canonical: "/saved" } };
export default function Page() { return <SavedView />; }
