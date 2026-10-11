import Link from "next/link";
import { Brand } from "./Brand";
import { INSTAGRAM } from "@/lib/site";
import { InstallButton } from "./InstallButton";
const col = (t: string, items: [string, string][]) => (<div><h2 className="mb-3 font-sans text-xs font-medium uppercase tracking-wider text-muted">{t}</h2><ul className="space-y-2 text-sm">{items.map(([l, h]) => <li key={l}><Link href={h} className="text-ink/80 hover:text-ink">{l}</Link></li>)}</ul></div>);
export function Footer() {
  return (<footer className="mt-24 border-t border-line bg-s1 pb-28 md:pb-16"><div className="wrap grid gap-10 py-12 md:grid-cols-4">
    <div className="md:col-span-2"><Brand /><p className="mt-2 text-sm text-muted">Discover. Understand. Compare. Decide.</p>
      <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer me" className="mt-3 inline-block text-sm text-accent hover:underline">Follow @ayushpicks on Instagram ↗</a>
      <InstallButton />
      <p className="mt-4 max-w-sm text-xs text-muted">AyushPicks doesn&apos;t sell products. We link to retailers and may earn a commission if you buy. It never changes our verdicts.</p></div>
    {col("Explore", [["Discover", "/search"], ["Categories", "/#categories"], ["Compare", "/compare"], ["Saved", "/saved"]])}
    {col("Information", [["About AyushPicks", "/about"], ["How it works", "/#how"], ["Editorial approach", "/about#editorial"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]])}
  </div><div className="wrap border-t border-line py-5 text-xs text-muted">© {new Date().getFullYear()} AyushPicks. All rights reserved.</div></footer>);
}
