'use client'

import Link from 'next/link'
import { ArrowRight, Check, ShoppingBag, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getSavedPicksKey, type SavedPick } from '@/components/pick-button'

export default function Page(){
  const [items,setItems]=useState<SavedPick[]>([])
  const sync=()=>{ try{setItems(JSON.parse(localStorage.getItem(getSavedPicksKey())||'[]'))}catch{setItems([])} }
  useEffect(()=>{sync(); const fn=()=>sync(); window.addEventListener('storage',fn); window.addEventListener('ayushpicks-cart-change',fn); return()=>{window.removeEventListener('storage',fn);window.removeEventListener('ayushpicks-cart-change',fn)}},[])
  function remove(id:string){ const next=items.filter(x=>x.id!==id); localStorage.setItem(getSavedPicksKey(),JSON.stringify(next)); setItems(next); window.dispatchEvent(new Event('ayushpicks-cart-change')) }
  return <div><section className="cartPageHero"><span className="sectionKicker">YOUR SHORTLIST</span><h1>Saved picks.</h1><p>Keep products here while you compare. No login required. AYUSHPICKS doesn’t sell or ship these products — when you’re ready, you’ll continue to the retailer.</p></section>{items.length ? <section className="cartGrid"><div className="cartList">{items.map(item=><article className="cartItem" key={item.id}><Link href={`/products/${item.slug}`} className="cartImage">{item.image_url&&<img src={item.image_url} alt={item.name}/>}</Link><div className="cartInfo"><span>{item.store||'AYUSHPICKS PICK'}</span><Link href={`/products/${item.slug}`}><h2>{item.name}</h2></Link>{item.price!=null&&<b>₹{Number(item.price).toLocaleString('en-IN')}</b>}<button type="button" onClick={()=>remove(item.id)}><Trash2 size={14}/> Remove</button></div></article>)}</div><aside className="cartAside"><ShoppingBag size={22}/><strong>{items.length} {items.length===1?'product':'products'}</strong><p>Your saved list stays on this browser until you remove it.</p><Link className="btn primary" href="/products">Continue discovering <ArrowRight size={16}/></Link></aside></section>:<section className="cartEmpty"><ShoppingBag size={30}/><h2>Your cart is empty.</h2><p>Save a product and it will stay here when you return to AYUSHPICKS on this browser.</p><Link className="btn primary" href="/products">Find products <ArrowRight size={16}/></Link></section>}<Footer/></div></main>
}
