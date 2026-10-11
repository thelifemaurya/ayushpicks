'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useRef } from 'react'

const icons:Record<string,string>={Accessories:'👜',Beauty:'✦',Electronics:'◈',Fashion:'◌',Gaming:'⌁',Home:'⌂',Kitchen:'◒',Other:'＋'}

export default function CategoryRail({ categories, active='' }: { categories:any[]; active?:string }) {
  const ref=useRef<HTMLDivElement>(null)
  const scroll=()=>ref.current?.scrollBy({left:220,behavior:'smooth'})
  return <div className="categoryRailWrap"><div className="categoryRail" ref={ref} aria-label="Categories"><Link className={!active?'active':''} href="/products"><span>✦</span>All</Link>{categories.map(c=><Link key={c.id} className={active===c.id?'active':''} href={`/products?category=${encodeURIComponent(c.id)}`}><span>{icons[c.name]||'✦'}</span>{c.name}</Link>)}</div><button className="categoryRailNext" type="button" onClick={scroll} aria-label="See more categories"><ChevronRight size={17}/></button></div>
}
