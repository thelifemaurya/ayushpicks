'use client'

import Link from 'next/link'
import { ArrowRight, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

type SearchItem = { name:string; slug:string; category?:string|null; href?:string }

function normalize(value:string){
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()
}

function distance(a:string,b:string){
  const aa=normalize(a), bb=normalize(b)
  if(!aa || !bb) return 99
  const prev=Array.from({length:bb.length+1},(_,i)=>i)
  for(let i=1;i<=aa.length;i++){
    let left=i
    for(let j=1;j<=bb.length;j++){
      const old=prev[j]
      prev[j]=aa[i-1]===bb[j-1] ? left : Math.min(prev[j]+1,left+1,prev[j-1]+1)
      left=old
    }
  }
  return prev[bb.length]
}

function itemScore(query:string,item:SearchItem){
  const q=normalize(query)
  const name=normalize(item.name)
  if(!q) return 99
  if(name.includes(q)) return 0
  return Math.min(distance(q,name),...name.split(' ').map(word=>distance(q,word)))
}

export default function SearchPanel({ items }: { items:SearchItem[] }){
  const [value,setValue]=useState('')
  const clean=normalize(value)
  const suggestions=useMemo(()=>{
    if(!clean) return items.slice(0,5)
    const scored=items.map(item=>({item,score:itemScore(clean,item)})).sort((a,b)=>a.score-b.score)
    const direct=items.filter(item=>normalize(item.name).includes(clean)).slice(0,5)
    const merged=[...direct,...scored.filter(x=>!direct.some(d=>d.slug===x.item.slug)).map(x=>x.item)]
    return merged.slice(0,6)
  },[clean,items])
  const nearest=useMemo(()=>{
    if(!clean) return null
    const scored=items.map(item=>({item,score:itemScore(clean,item)})).sort((a,b)=>a.score-b.score)
    const best=scored[0]
    return best && best.score <= Math.max(2,Math.ceil(clean.length*.34)) ? best.item : null
  },[clean,items])

  return <div className="standaloneSearch">
    <form action="/products" className="standaloneSearchForm" role="search">
      <Search size={19} aria-hidden="true"/>
      <input autoComplete="off" name="q" value={value} onChange={e=>setValue(e.target.value)} placeholder="Search products, brands or categories…" aria-label="Search products, brands or categories"/>
      {value && <button type="button" className="searchClear" onClick={()=>setValue('')} aria-label="Clear search"><X size={15}/></button>}
      <button className="btn primary searchSubmit" type="submit">Search <ArrowRight size={15}/></button>
    </form>
    {clean && nearest && !normalize(nearest.name).includes(clean) && <div className="searchCorrection">Did you mean <button type="button" onClick={()=>setValue(nearest.name)}>{nearest.name}</button>?</div>}
    <div className="searchSuggestions" aria-label="Search suggestions">
      <span className="searchSuggestionsLabel">{clean ? 'SUGGESTIONS' : 'TRY SEARCHING'}</span>
      <div className="searchSuggestionList">
        {suggestions.map(item=><Link key={item.slug} href={item.href || '/products?q='+encodeURIComponent(item.name)}>
          <span><strong>{item.name}</strong>{item.category && <small>{item.category}</small>}</span><ArrowRight size={14}/>
        </Link>)}
      </div>
    </div>
  </div>
}
