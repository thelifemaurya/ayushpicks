'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type Slide = { id:string; slug:string; name:string; image_url?:string|null; price?:number|null; short_description?:string|null; store?:string|null }

export default function HomeSpotlight({ slides }: { slides: Slide[] }) {
  const items = slides.slice(0, 4)
  const scroller = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setInterval>|null>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const syncIndex = useCallback(() => {
    const el = scroller.current
    if (!el || !items.length) return
    const first = el.querySelector<HTMLElement>('[data-spotlight-slide]')
    if (!first) return
    const step = first.offsetWidth + 16
    setIndex(Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / step))))
  }, [items.length])

  const go = useCallback((next:number, smooth=true) => {
    const el = scroller.current
    if (!el || !items.length) return
    const target = Math.max(0, Math.min(items.length - 1, next))
    const first = el.querySelector<HTMLElement>('[data-spotlight-slide]')
    if (!first) return
    el.scrollTo({ left: target * (first.offsetWidth + 16), behavior: smooth ? 'smooth' : 'auto' })
  }, [items.length])

  useEffect(() => {
    const el = scroller.current
    if (!el || items.length < 2 || paused) return
    timer.current = setInterval(() => {
      setIndex(current => {
        const next = current + 1 >= items.length ? 0 : current + 1
        requestAnimationFrame(() => go(next, true))
        return next
      })
    }, 3200)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [go, items.length, paused])

  if (!items.length) return null

  return (
    <section
      className="homeSpotlight"
      aria-label="AYUSHPICKS spotlight"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => window.setTimeout(() => setPaused(false), 1800)}
    >
      <div
        ref={scroller}
        className="spotlightScroller"
        onScroll={syncIndex}
        onWheel={e => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.currentTarget.scrollLeft += e.deltaY
            e.preventDefault()
          }
        }}
      >
        {items.map((slide, i) => (
          <Link
            key={slide.id}
            data-spotlight-slide
            className="spotlightSlide"
            href={`/products/${slide.slug}`}
            aria-label={`Open ${slide.name}`}
          >
            <div className="spotlightMedia">
              {slide.image_url ? <img src={slide.image_url} alt={slide.name} draggable={false} /> : <div className="spotlightFallback">AYUSHPICKS</div>}
              <span className="spotlightIndex">{String(i + 1).padStart(2,'0')} / {String(items.length).padStart(2,'0')}</span>
            </div>
            <div className="spotlightContent">
              <span className="spotlightKicker">IN THE SPOTLIGHT · {slide.store || 'SELECTED PICK'}</span>
              <h2>{slide.name}</h2>
              {slide.short_description && <p>{slide.short_description}</p>}
              <span className="spotlightCta">View product <ArrowUpRight size={16}/></span>
            </div>
          </Link>
        ))}
      </div>

      <div className="spotlightControls">
        <button type="button" onClick={() => go(index - 1)} aria-label="Previous spotlight"><ChevronLeft size={17}/></button>
        <div className="spotlightDots" aria-label="Spotlight slides">
          {items.map((item, i) => (
            <button key={item.id} type="button" className={i===index?'active':''} onClick={() => go(i)} aria-label={`Show slide ${i+1}`} />
          ))}
        </div>
        <button type="button" onClick={() => go(index + 1)} aria-label="Next spotlight"><ChevronRight size={17}/></button>
      </div>
    </section>
  )
}
