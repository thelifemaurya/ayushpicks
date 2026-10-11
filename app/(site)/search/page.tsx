import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "./SearchView";
export const metadata: Metadata = { title: "Discover Products", description: "Search AyushPicks by product name, category, brand or use case and filter by rating, price and features.", alternates: { canonical: "/search" } };
export default function Page() { return <Suspense fallback={<div className="wrap py-10"><h1 className="text-3xl font-semibold">Discover</h1></div>}><SearchView /></Suspense>; }
