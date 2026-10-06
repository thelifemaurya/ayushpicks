'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Slide = { id:string; slug:string; name:string; image_url?:string|null; price?:number|null; short_description?:string|null; store?:string|null }

export default function HomeSpotlight({ slides }: { slides: Slide[] }) {
  const items = slides.slice(0, 4)
  const [index, setIndex] = useState(0)
  const startX = useRef<number|null>(null)
  const timer = useRef<ReturnType<typeof setInterval>|null>(null)

  useEffect(() => {
    if (items.length < 2) return
    timer.current = setInterval(() => setIndex(i => (i + 1) % items.length), 1800)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [items.length])

  if (!items.length) return null
  const slide = items[index]

  const move = (direction:number) => setIndex(i => (i + direction + items.length) % items.length)

  return (
    <section
      className="homeSpotlight"
      aria-label="AYUSHPICKS spotlight"
      onTouchStart={e => { startX.current = e.touches[0]?.clientX ?? null }}
      onTouchEnd={e => {
        if (startX.current == null) return
        const delta = e.changedTouches[0]?.clientX - startX.current
        if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1)
        startX.current = null
      }}
    >
      <div className="spotlightMedia" key={slide.id}>
        {slide.image_url ? <img src={slide.image_url} alt={slide.name} /> : <div className="spotlightFallback">AYUSHPICKS</div>}
        <span className="spotlightIndex">{String(index + 1).padStart(2,'0')} / {String(items.length).padStart(2,'0')}</span><span className="spotlightLive"><i/> AUTO ROTATE</span>
      </div>
      <Link className="spotlightContent" key={`content-${slide.id}`} href={`/products/${slide.slug}`} aria-label={`Open ${slide.name}`}>
        <span className="spotlightKicker">IN THE SPOTLIGHT · {slide.store || 'SELECTED PICK'}</span>
        <h2>{slide.name}</h2>
        {slide.short_description && <p>{slide.short_description}</p>}
        <span className="spotlightCta">View product <ArrowUpRight size={16}/></span>
      </Link>
      <div className="spotlightProgress" aria-hidden="true"><span style={{width:`${((index+1)/items.length)*100}%`}} /></div><div className="spotlightControls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous spotlight"><ChevronLeft size={17}/></button>
        <div className="spotlightDots">{items.map((item,i)=><button key={item.id} type="button" className={i===index?'active':''} onClick={() => setIndex(i)} aria-label={`Show slide ${i+1}`} />)}</div>
        <button type="button" onClick={() => move(1)} aria-label="Next spotlight"><ChevronRight size={17}/></button>
      </div>
    </section>
  )
}
