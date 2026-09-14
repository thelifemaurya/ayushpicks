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
        <div className="filterheading"><strong>Categories</strong><span>{active ? 'Filtered' : 'All products'}</span></div>
        {pending && <span className="filterloading">Updating…</span>}
      </div>
      <div className="filterchips" aria-label="Product categories">
        <button type="button" className={!active ? 'filterchip active' : 'filterchip'} onClick={() => selectCategory('')} disabled={pending}>All</button>
        {categories.map((c: any) => <button type="button" key={c.id} className={active === c.id ? 'filterchip active' : 'filterchip'} onClick={() => selectCategory(c.id)} disabled={pending}>{c.name}</button>)}
      </div>
      {(active || q) && <div className="activefilter"><span>{active ? `Category: ${categories.find((c: any) => c.id === active)?.name || 'Selected'}` : `Search: “${q}”`}</span><Link href="/products">Clear</Link></div>}
      <style jsx>{`
        .filterbar{border:1px solid var(--line);background:var(--panel);border-radius:15px;padding:13px 14px}
        .filtertop{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.filterheading{display:flex;gap:8px;align-items:baseline}.filterheading strong{font-size:13px}.filterheading span{font-size:11px;color:var(--muted)}.filterloading{font-size:11px;color:var(--accent);animation:pulse 1s infinite}
        .filterchips{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding:1px}.filterchips::-webkit-scrollbar{display:none}
        .filterchip{flex:0 0 auto;border:1px solid var(--line);background:transparent;color:var(--muted);border-radius:999px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all .18s ease}.filterchip:hover:not(:disabled){color:var(--text);border-color:#68758b;transform:translateY(-1px)}.filterchip.active{background:var(--text);color:var(--bg);border-color:var(--text)}.filterchip:disabled{opacity:.55;cursor:wait}
        .activefilter{display:flex;justify-content:space-between;gap:10px;border-top:1px solid var(--line);margin-top:10px;padding-top:9px;color:var(--muted);font-size:11px}.activefilter a{color:var(--text);font-weight:700}.activefilter a:hover{color:var(--accent)}
        @keyframes pulse{50%{opacity:.45}}@media(max-width:650px){.filterbar{padding:11px 12px}.filterchip{padding:7px 11px}}
      `}</style>
    </div>
  )
}
