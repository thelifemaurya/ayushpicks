'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type Slide = {
  id:string
  slug:string
  name:string
  image_url?:string|null
  price?:number|null
  short_description?:string|null
  store?:string|null
}

export default function HomeSpotlight({ slides }: { slides: Slide[] }) {
  const items = slides.slice(0, 4)
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startX = useRef(0)
  const currentX = useRef(0)
  const timer = useRef<ReturnType<typeof setInterval>|null>(null)

  const stopTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    if (items.length < 2) return
    timer.current = setInterval(() => {
      setIndex(current => current + 1 >= items.length ? 0 : current + 1)
    }, 3200)
  }, [items.length, stopTimer])

  useEffect(() => {
    startTimer()
    return stopTimer
  }, [startTimer, stopTimer])

  const go = useCallback((next:number) => {
    setIndex(Math.max(0, Math.min(items.length - 1, next)))
  }, [items.length])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    stopTimer()
    startX.current = e.clientX
    currentX.current = e.clientX
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    currentX.current = e.clientX
    setDragOffset(e.clientX - startX.current)
  }

  const onPointerUp = () => {
    if (!dragging) return
    const delta = currentX.current - startX.current
    const threshold = 55
    if (Math.abs(delta) > threshold) {
      setIndex(current => delta < 0 ? Math.min(items.length - 1, current + 1) : Math.max(0, current - 1))
    }
    setDragging(false)
    setDragOffset(0)
    window.setTimeout(startTimer, 1800)
  }

  if (!items.length) return null

  return (
    <section className="homeSpotlight" aria-label="AYUSHPICKS spotlight">
      <div
        className="spotlightViewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseEnter={stopTimer}
        onMouseLeave={() => { if (!dragging) startTimer() }}
      >
        <div
          className="spotlightTrack"
          style={{
            transform: `translate3d(calc(-${index * 100}% + ${dragOffset}px),0,0)`,
            transition: dragging ? 'none' : 'transform 620ms cubic-bezier(.22,.75,.2,1)',
          }}
        >
          {items.map((slide, i) => (
            <Link
              key={slide.id}
              className="spotlightSlide"
              href={`/products/${slide.slug}`}
              draggable={false}
              onClick={e => { if (Math.abs(currentX.current - startX.current) > 8) e.preventDefault() }}
              aria-label={`Open ${slide.name}`}
            >
              <div className="spotlightMedia">
                {slide.image_url
                  ? <img src={slide.image_url} alt={slide.name} draggable={false} />
                  : <div className="spotlightFallback">AYUSHPICKS</div>}
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
      </div>

      <div className="spotlightControls">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous spotlight"><ChevronLeft size={17}/></button>
        <div className="spotlightDots" aria-label="Spotlight slides">
          {items.map((item, i) => (
            <button key={item.id} type="button" className={i===index?'active':''} onClick={() => go(i)} aria-label={`Show slide ${i+1}`} />
          ))}
        </div>
        <button type="button" onClick={() => go(index + 1)} disabled={index === items.length - 1} aria-label="Next spotlight"><ChevronRight size={17}/></button>
      </div>
    </section>
  )
}
