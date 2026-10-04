'use client'

import { useEffect, useState } from 'react'

const letters = 'KSNATIC'.split('')

export default function IntroSplash() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const key = 'ksnatic-intro-seen'
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    setVisible(true)

    const exitTimer = window.setTimeout(() => setLeaving(true), 2150)
    const doneTimer = window.setTimeout(() => setVisible(false), 3050)
    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(doneTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div className={`introSplash ${leaving ? 'isLeaving' : ''}`} aria-hidden="true">
      <div className="introWord">
        {letters.map((letter, index) => (
          <span key={letter} style={{ '--i': index } as React.CSSProperties}>{letter}</span>
        ))}
      </div>
      <style jsx global>{`
        .introSplash{position:fixed;inset:0;z-index:99999;background:#fff;color:#000;display:grid;place-items:center;overflow:hidden;pointer-events:none}
        .introWord{display:flex;align-items:center;justify-content:center;font-family:'Kaensla',Georgia,serif;font-weight:400;font-size:clamp(62px,10vw,118px);line-height:.8;letter-spacing:-.075em;color:#000}
        .introWord span{display:inline-block;opacity:0;transform:translateX(90px) translateY(8px) scale(.94);filter:blur(5px);animation:introLetter .52s cubic-bezier(.22,1,.36,1) forwards;animation-delay:calc((6 - var(--i)) * .12s + .08s);will-change:transform,opacity,filter}
        .introWord span:nth-child(1){animation-delay:.80s}.introWord span:nth-child(2){animation-delay:.68s}.introWord span:nth-child(3){animation-delay:.56s}.introWord span:nth-child(4){animation-delay:.44s}.introWord span:nth-child(5){animation-delay:.32s}.introWord span:nth-child(6){animation-delay:.20s}.introWord span:nth-child(7){animation-delay:.08s}
        .introSplash.isLeaving .introWord{animation:introToCorner .86s cubic-bezier(.76,0,.16,1) forwards}
        .introSplash.isLeaving .introWord span{animation:none;opacity:1;filter:none;transform:none}
        .introSplash.isLeaving{animation:introFade .86s cubic-bezier(.76,0,.16,1) forwards}
        @keyframes introLetter{0%{opacity:0;transform:translateX(90px) translateY(8px) scale(.94);filter:blur(5px)}45%{opacity:1;transform:translateX(-5px) translateY(0) scale(1.015);filter:blur(0)}72%{transform:translateX(2px) scale(.998)}100%{opacity:1;transform:translateX(0) translateY(0) scale(1);filter:blur(0)}}
        @keyframes introToCorner{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(calc(-50vw + 48px),calc(-50vh + 38px)) scale(.34);transform-origin:center;opacity:0}}
        @keyframes introFade{0%{opacity:1;background:#fff}75%{opacity:1;background:#fff}100%{opacity:0;background:transparent;visibility:hidden}}
        @media(max-width:650px){.introWord{font-size:clamp(48px,15vw,78px)}}
        @media(prefers-reduced-motion:reduce){.introSplash{display:none!important}}
      `}</style>
    </div>
  )
}
