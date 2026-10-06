'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'

export default function ProductFilters({ categories }: { categories: any[] }) {
  const router=useRouter(), pathname=usePathname(), params=useSearchParams(), [pending,startTransition]=useTransition()
  const ref=useRef<HTMLDivElement>(null)
  const active=params.get('category')||'', q=params.get('q')||''
  const iconFor=(name:string)=>({Accessories:'👜',Beauty:'✦',Electronics:'◈',Fashion:'◌',Gaming:'⌁',Home:'⌂',Kitchen:'◒',Other:'＋'} as Record<string,string>)[name]||'✦'
  function selectCategory(category:string){
    const next=new URLSearchParams(params.toString())
    category?next.set('category',category):next.delete('category')
    startTransition(()=>router.push(`${pathname}${next.toString()? `?${next}`:''}`,{scroll:false}))
  }
  return <div className="filterbar">
    <div className="filtertop"><div className="filterheading"><strong>Categories</strong><span>{active?'Selected':'All products'}</span></div>{pending&&<span className="filterloading">Updating…</span>}</div>
    <div className="filterScroller">
      <div className="filterchips" ref={ref} aria-label="Product categories">
        <button type="button" className={!active?'filterchip active':'filterchip'} onClick={()=>selectCategory('')} disabled={pending}><span>✦</span>All</button>
        {categories.map((c:any)=><button type="button" key={c.id} className={active===c.id?'filterchip active':'filterchip'} onClick={()=>selectCategory(c.id)} disabled={pending}><span>{iconFor(c.name)}</span>{c.name}</button>)}
      </div>
      <button type="button" className="filterNext" onClick={()=>ref.current?.scrollBy({left:220,behavior:'smooth'})} aria-label="Scroll categories"><ChevronRight size={17}/></button>
    </div>
    {(active||q)&&<div className="activefilter"><span>{active?`Category: ${categories.find((c:any)=>c.id===active)?.name||'Selected'`:`Search: “${q}”`}</span><Link href="/products">Clear</Link></div>}
    <style jsx>{`
      .filterbar{width:100%;border:1px solid var(--line);background:var(--panel);padding:11px 12px;overflow:hidden}
      .filtertop{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.filterheading{display:flex;gap:7px;align-items:baseline}.filterheading strong{font-size:12px}.filterheading span,.filterloading{font-size:10px;color:var(--muted)}
      .filterScroller{position:relative;min-width:0}.filterchips{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding:1px 42px 3px 1px;scroll-behavior:smooth}.filterchips::-webkit-scrollbar{display:none}
      .filterchip{flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;border:1px solid var(--line);background:var(--panel2);color:var(--muted);padding:9px 12px;font-size:11px;font-weight:650;cursor:pointer;transition:.16s ease}
      .filterchip.active{background:var(--text);color:var(--bg);border-color:var(--text)}.filterchip:hover:not(:disabled){border-color:var(--accent);color:var(--text)}.filterchip:disabled{opacity:.55}
      .filterNext{position:absolute;right:0;top:0;width:36px;height:36px;border:1px solid var(--line);background:var(--panel);color:var(--text);display:grid;place-items:center;box-shadow:-12px 0 18px color-mix(in srgb,var(--panel) 80%,transparent);cursor:pointer}
      .activefilter{display:flex;justify-content:space-between;gap:10px;border-top:1px solid var(--line);margin-top:8px;padding-top:8px;color:var(--muted);font-size:10px}.activefilter span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.activefilter a{color:var(--accent);font-weight:700}
    `}</style>
  </div>
}
