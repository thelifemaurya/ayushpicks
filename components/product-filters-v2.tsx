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
  const activeName = categories.find((c:any)=>c.id===active)?.name || 'Selected'
  const activeLabel = active ? 'Category: ' + activeName : q ? 'Search: “' + q + '”' : ''
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
    {activeLabel&&<div className="activefilter"><span>{activeLabel}</span><Link href="/products">Clear</Link></div>}
  </div>
}
