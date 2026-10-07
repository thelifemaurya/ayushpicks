'use client'

import Link from 'next/link'
import { Home, Search, Grid2X2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import CartLink from './cart-link'

export default function MobileBottomNav(){
  const pathname=usePathname()
  const router=useRouter()
  useEffect(() => { router.prefetch('/'); router.prefetch('/search'); router.prefetch('/categories'); router.prefetch('/cart') }, [router])
  const home=pathname==='/' 
  const search=pathname==='/search'
  const categories=pathname==='/categories'
  const cart=pathname==='/cart'
  return <nav className="mobileBottomNav" aria-label="Mobile navigation">
    <Link prefetch href="/" className={'mobileBottomItem'+(home?' active':'')}><Home size={18}/><span>Home</span></Link>
    <Link prefetch href="/search" className={'mobileBottomItem'+(search?' active':'')}><Search size={18}/><span>Search</span></Link>
    <Link prefetch href="/categories" className={'mobileBottomItem'+(categories?' active':'')}><Grid2X2 size={18}/><span>Categories</span></Link>
    <CartLink mobile active={cart} />
  </nav>
}
