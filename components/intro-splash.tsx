'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const letters = 'KSNATIC'.split('')

export default function IntroSplash() {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // The intro is intentionally shown on every fresh page load.
    // Do not gate it with sessionStorage: the brand reveal is part of the site experience.
    const moveTimer = window.setTimeout(() => setLeaving(true), 2050)
    const doneTimer = window.setTimeout(() => setVisible(false), 3000)

    return () => {
      window.clearTimeout(moveTimer)
      window.clearTimeout(doneTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div className={`introSplash ${leaving ? 'isLeaving' : ''}`} aria-hidden="true">
      <div className="introWord">
        {letters.map((letter, index) => (
          <span key={letter} style={{ '--i': index } as React.CSSProperties}>
            {letter}
          </span>
        ))}
      </div>

      <Image
        className="introLogo"
        src="/ksnatic-logo.png"
        alt=""
        width={220}
        height={64}
        priority
      />

      <style jsx global>{`
        .introSplash{
          position:fixed;
          inset:0;
          z-index:99999;
          background:#fff;
          color:#090a0c;
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
          pointer-events:none;
        }

        .introWord{
          display:flex;
          align-items:center;
          justify-content:center;
          font:900 clamp(50px,9vw,96px)/.9 Manrope,system-ui,sans-serif;
          letter-spacing:-.09em;
          position:relative;
          z-index:2;
        }

        .introWord span{
          display:inline-block;
          opacity:0;
          transform:translateX(52px) scale(.72);
          filter:blur(9px);
          animation:introPop .48s cubic-bezier(.16,1,.3,1) forwards;
          animation-delay:calc((6 - var(--i)) * .105s + .08s);
          will-change:transform,opacity,filter;
        }

        .introWord span:nth-child(odd){
          text-shadow:3px 0 #ff4b75,-3px 0 #637cff;
        }

        .introWord span:nth-child(even){
          text-shadow:-3px 0 #8a5cff,3px 0 #00b8ff;
        }

        .introSplash.isLeaving .introWord{
          animation:introWordOut .55s cubic-bezier(.7,0,.2,1) forwards;
        }

        .introSplash.isLeaving .introWord span{
          animation:none;
          opacity:1;
          transform:none;
          filter:none;
        }

        .introLogo{
          position:absolute;
          top:17px;
          left:17px;
          width:min(210px,34vw);
          height:auto;
          object-fit:contain;
          opacity:0;
          z-index:3;
          transform:translate(50vw,42vh) scale(2.35);
          transform-origin:top left;
          will-change:transform,opacity;
        }

        .introSplash.isLeaving .introLogo{
          animation:introLogoToCorner .78s cubic-bezier(.7,0,.2,1) forwards;
        }

        .introSplash.isLeaving{
          animation:introCurtain .78s cubic-bezier(.7,0,.2,1) .08s forwards;
        }

        @keyframes introPop{
          0%{opacity:0;transform:translateX(52px) scale(.72);filter:blur(9px)}
          35%{opacity:1;transform:translateX(-7px) scale(1.08);filter:blur(0)}
          55%{transform:translateX(4px) scale(.98)}
          72%{transform:translateX(-2px)}
          100%{opacity:1;transform:translateX(0) scale(1);filter:blur(0)}
        }

        @keyframes introWordOut{
          0%{opacity:1;transform:scale(1)}
          100%{opacity:0;transform:scale(.9);filter:blur(7px)}
        }

        @keyframes introLogoToCorner{
          0%{opacity:0;transform:translate(50vw,42vh) scale(2.35)}
          32%{opacity:1;transform:translate(34vw,25vh) scale(1.8)}
          68%{opacity:1;transform:translate(12vw,6vh) scale(1.18)}
          100%{opacity:1;transform:translate(0,0) scale(1)}
        }

        @keyframes introCurtain{
          0%{background:#fff;opacity:1}
          70%{background:#fff;opacity:1}
          100%{background:transparent;opacity:0;visibility:hidden}
        }

        @media(max-width:650px){
          .introWord{font-size:clamp(43px,13vw,70px)}
          .introLogo{width:min(165px,42vw);top:14px;left:14px}
        }

        @media(prefers-reduced-motion:reduce){
          .introSplash{display:none!important}
        }
      `}</style>
    </div>
  )
}
