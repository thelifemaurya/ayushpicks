'use client'

import { Check, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'

export type SavedPick = { id:string; slug:string; name:string; image_url?:string|null; price?:number|null; store?:string|null }

const KEY = 'ayushpicks-cart-v1'

function read(): SavedPick[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function PickButton({ product }: { product: SavedPick }) {
  const [saved,setSaved] = useState(false)
  useEffect(() => setSaved(read().some(x => x.id === product.id)), [product.id])

  function toggle(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    const next = read()
    const exists = next.some(x => x.id === product.id)
    const updated = exists ? next.filter(x => x.id !== product.id) : [product, ...next]
    localStorage.setItem(KEY, JSON.stringify(updated))
    setSaved(!exists)
    window.dispatchEvent(new Event('ayushpicks-cart-change'))
  }

  return <button type="button" className={`pickButton ${saved?'saved':''}`} onClick={toggle}>{saved ? <Check size={14}/> : <ShoppingBag size={14}/>} {saved ? 'In cart' : 'Add to cart'}</button>
}

export function getSavedPicksKey(){ return KEY }
