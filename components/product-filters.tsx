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
    startTransition(() => router.push(`${pathname}${next.toString() ? `?${next}` : ''}`))
  }

  return (
    <div className="filterbar">
      <div className="filtertop">
        <div>
          <span className="filterlabel">Browse by category</span>
          <span className="filterhint">{active ? 'Showing selected picks' : 'Explore all picks'}</span>
        </div>
        {pending && <span className="filterloading">Updating…</span>}
      </div>
      <div className="filterchips" aria-label="Product categories">
        <button className={!active ? 'filterchip active' : 'filterchip'} onClick={() => selectCategory('')} disabled={pending}>All picks</button>
        {categories.map((c: any) => (
          <button key={c.id} className={active === c.id ? 'filterchip active' : 'filterchip'} onClick={() => selectCategory(c.id)} disabled={pending}>
            {c.name}
          </button>
        ))}
      </div>
      {(active || q) && (
        <div className="activefilter">
          <span>{q ? `Search: “${q}”` : 'Category selected'}</span>
          <Link href="/products">Clear filters</Link>
        </div>
      )}
    </div>
  )
}
