'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getSavedPicksKey } from './pick-button'

export default function CartLink({ mobile = false, active = false }: { mobile?: boolean; active?: boolean }) {
  const [count,setCount] = useState(0)
  useEffect(() => {
    const sync = () => { try { setCount(JSON.parse(localStorage.getItem(getSavedPicksKey()) || '[]').length) } catch {} }
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('ayushpicks-cart-change', sync)
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('ayushpicks-cart-change', sync) }
  }, [])
  return <Link href="/cart" className={mobile ? 'mobileBottomItem' + (active ? ' active' : '') : 'cartLink'} aria-label={`Cart${count ? ` with ${count} items` : ''}`}><ShoppingBag size={mobile?18:17}/><span>{mobile ? 'Cart' : 'Cart'}</span>{count>0 && <b className="cartCount">{count}</b>}</Link>
}
