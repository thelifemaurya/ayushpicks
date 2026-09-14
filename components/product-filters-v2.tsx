'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export default function ProductFilters({ categories }: { categories: any[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const active = params.get('category') || ''
  const q = params.get('q') || ''

  function selectCategory(category: string) {
    const next = new URLSearchParams(params.toString())
    if (category) next.set('category', category)
    else next.delete('category')
    startTransition(() => router.push(`${pathname}${next.toString() ? `?${next}` : ''}`, { scroll: false }))
  }

  return (
    <div className="filterbar">
      <div className="filtertop">
        <div className="filterheading"><strong>Category</strong><span>{active ? 'Selected' : 'All products'}</span></div>
        {pending && <span className="filterloading">Updating…</span>}
      </div>
      <div className="filterchips" aria-label="Product categories">
        <button type="button" className={!active ? 'filterchip active' : 'filterchip'} onClick={() => selectCategory('')} disabled={pending}>All</button>
        {categories.map((c: any) => <button type="button" key={c.id} className={active === c.id ? 'filterchip active' : 'filterchip'} onClick={() => selectCategory(c.id)} disabled={pending}>{c.name}</button>)}
      </div>
      {(active || q) && <div className="activefilter"><span>{active ? `Category: ${categories.find((c: any) => c.id === active)?.name || 'Selected'}` : `Search: “${q}”`}</span><Link href="/products">Clear</Link></div>}
      <style jsx>{`
        .filterbar{width:100%;min-width:0;max-width:100%;border:1px solid var(--line);background:var(--panel);border-radius:12px;padding:10px 11px;overflow:hidden}
        .filtertop{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0;margin-bottom:8px}
        .filterheading{display:flex;gap:7px;align-items:baseline;min-width:0}.filterheading strong{font-size:12px}.filterheading span{font-size:10px;color:var(--muted);white-space:nowrap}
        .filterloading{font-size:10px;color:var(--accent);white-space:nowrap}
        .filterchips{display:flex;width:100%;max-width:100%;min-width:0;gap:6px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;padding:1px 1px 3px;-webkit-overflow-scrolling:touch;touch-action:pan-x}
        .filterchips::-webkit-scrollbar{display:none}
        .filterchip{flex:0 0 auto;white-space:nowrap;border:1px solid var(--line);background:var(--panel2);color:var(--muted);border-radius:8px;padding:6px 10px;font-size:11px;font-weight:600;line-height:1.2;cursor:pointer;transition:background .16s ease,border-color .16s ease,color .16s ease,transform .16s ease}
        .filterchip:hover:not(:disabled){color:var(--text);border-color:var(--accent);transform:translateY(-1px)}
        .filterchip.active{background:rgba(79,111,240,.14);color:var(--accent);border-color:rgba(79,111,240,.5);box-shadow:inset 0 0 0 1px rgba(79,111,240,.06)}
        .filterchip:disabled{opacity:.6;cursor:wait}
        .activefilter{display:flex;justify-content:space-between;gap:10px;min-width:0;border-top:1px solid var(--line);margin-top:8px;padding-top:8px;color:var(--muted);font-size:10px}.activefilter span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.activefilter a{color:var(--accent);font-weight:700;flex:none}
      `}</style>
    </div>
  )
}
