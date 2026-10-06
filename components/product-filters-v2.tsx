'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'

export default function ProductFilters({ categories }: { categories: any[] }) {
  const router=useRouter()
  const pathname=usePathname()
  const params=useSearchParams()
  const ref=useRef<HTMLDivElement>(null)
  const active=params.get('category') || ''
  const q=params.get('q') || ''
  const iconFor=(name:string)=>({Accessories:'👜',Beauty:'✦',Electronics:'◈',Fashion:'◌',Gaming:'⌁',Home:'⌂',Kitchen:'◒',Other:'＋'} as Record<string,string>)[name] || '✦'
  function selectCategory(category:string){
    const next=new URLSearchParams(params.toString())
    if(category) next.set('category',category); else next.delete('category')
    router.replace(next.toString() ? pathname + '?' + next.toString() : pathname,{scroll:false})
  }
  return <div className="filterbar">
    <div className="filtertop"><div className="filterheading"><strong>Categories</strong><span>{active ? 'Selected' : 'All products'}</span></div></div>
    <div className="filterScroller">
      <div className="filterchips" ref={ref} aria-label="Product categories">
        <button type="button" className={!active ? 'filterchip active' : 'filterchip'} onClick={()=>selectCategory('')}><span>✦</span>All</button>
        {categories.map((c:any)=><button type="button" key={c.id} className={active===c.id ? 'filterchip active' : 'filterchip'} onClick={()=>selectCategory(c.id)}><span>{iconFor(c.name)}</span>{c.name}</button>)}
      </div>
      <button type="button" className="filterNext" onClick={()=>ref.current?.scrollBy({left:220,behavior:'smooth'})} aria-label="Scroll categories"><ChevronRight size={17}/></button>
    </div>
    {(active || q) && <div className="activefilter"><span>{active ? 'Category: ' + (categories.find((c:any)=>c.id===active)?.name || 'Selected') : 'Search: “' + q + '”'}</span><Link href="/products">Clear</Link></div>}
  </div>
}
