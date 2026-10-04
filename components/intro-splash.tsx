'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const letters = 'KSNATIC'.split('')

export default function IntroSplash() {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('ksnatic-intro-seen')) {
      setVisible(false)
      return
    }
    const moveTimer = window.setTimeout(() => setLeaving(true), 2050)
    const doneTimer = window.setTimeout(() => {
      sessionStorage.setItem('ksnatic-intro-seen', '1')
      setVisible(false)
    }, 3000)
    return () => {
      window.clearTimeout(moveTimer)
      window.clearTimeout(doneTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <>
      <div className={`introSplash ${leaving ? 'isLeaving' : ''}`} aria-hidden="true">
        <div className="introWord">
          {letters.map((letter, index) => (
            <span key={letter} style={{ '--i': index } as React.CSSProperties}>{letter}</span>
          ))}
        </div>
        <Image className="introLogo" src="/ksnatic-logo.png" alt="" width={220} height={64} priority />
      </div>
      <style jsx global>{`
        .introSplash{position:fixed;inset:0;z-index:9999;background:#fff;color:#090a0c;display:flex;align-items:center;justify-content:center;overflow:hidden;pointer-events:none}
        .introWord{display:flex;align-items:center;font:800 clamp(48px,9vw,92px)/1 Manrope,system-ui,sans-serif;letter-spacing:-.085em;position:relative;z-index:2}
        .introWord span{display:inline-block;opacity:0;transform:translate(44px,0) scale(.82);filter:blur(7px);animation:introLetter .52s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--i) * .105s + .08s)}
        .introWord span:nth-child(odd){text-shadow:2px 0 #6d8cff,-2px 0 #ff4d7d}
        .introWord span:nth-child(even){text-shadow:-2px 0 #7c4dff,2px 0 #00b8ff}
        .introSplash.isLeaving .introWord{animation:introAssembleExit .62s cubic-bezier(.65,0,.25,1) forwards}
        .introSplash.isLeaving .introWord span{animation:none;opacity:1;transform:none}
        .introLogo{position:absolute;width:min(220px,34vw);height:auto;object-fit:contain;opacity:0;z-index:3;top:16px;left:16px;transform:translate(50vw,42vh) scale(2.25);transform-origin:top left}
        .introSplash.isLeaving .introLogo{animation:introLogoFlight .78s cubic-bezier(.7,0,.2,1) forwards}
        .introSplash.isLeaving{animation:introCurtain .78s cubic-bezier(.7,0,.2,1) .08s forwards}
        @keyframes introLetter{0%{opacity:0;transform:translate(44px,0) scale(.82);filter:blur(7px)}35%{opacity:1;transform:translate(-6px,0) scale(1.04);filter:blur(0)}55%{transform:translate(4px,0) scale(.99)}72%{transform:translate(-2px,0)}100%{opacity:1;transform:translate(0,0) scale(1);filter:blur(0)}}
        @keyframes introAssembleExit{0%{opacity:1;transform:scale(1);filter:blur(0)}100%{opacity:0;transform:scale(.9);filter:blur(5px)}}
        @keyframes introLogoFlight{0%{opacity:0;transform:translate(50vw,42vh) scale(2.25)}35%{opacity:1;transform:translate(35vw,26vh) scale(1.85)}100%{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes introCurtain{0%{background:#fff;opacity:1}72%{background:#fff;opacity:1}100%{background:transparent;opacity:0;visibility:hidden}}
        @media(prefers-reduced-motion:reduce){.introSplash{display:none!important}}
      `}</style>
    </>
  )
}
