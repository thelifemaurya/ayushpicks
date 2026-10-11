import type { Metadata } from "next";
export const metadata: Metadata = { title: "AyushPicks Admin", robots: { index: false, follow: false, nocache: true } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-s1">{children}</div>; }
