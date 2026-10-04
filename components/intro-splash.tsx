'use client'

import { useEffect, useState } from 'react'

const letters = 'KSNATIC'.split('')

export default function IntroSplash() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const key = 'ksnatic-intro-seen'
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
    setVisible(true)

    const exitTimer = window.setTimeout(() => setLeaving(true), 2250)
    const doneTimer = window.setTimeout(() => setVisible(false), 3150)
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
        @font-face{
          font-family:'Kaensla';
          src:url('https://st.1001fonts.net/download/font/kaensla.regular.otf') format('opentype');
          font-style:normal;
          font-weight:400;
          font-display:swap;
        }

        .introSplash{
          position:fixed;
          inset:0;
          z-index:99999;
          background:#fff;
          color:#000;
          display:grid;
          place-items:center;
          overflow:hidden;
          pointer-events:none;
        }

        .introWord{
          display:flex;
          align-items:center;
          justify-content:center;
          font-family:'Kaensla',Georgia,'Times New Roman',serif;
          font-weight:400;
          font-size:clamp(64px,10vw,120px);
          line-height:.78;
          letter-spacing:-.065em;
          color:#000;
          white-space:nowrap;
        }

        .introWord span{
          display:inline-block;
          opacity:0;
          transform:translateX(105px) translateY(8px) scale(.9);
          filter:blur(4px);
          animation:introLetter .56s cubic-bezier(.22,1,.36,1) forwards;
          will-change:transform,opacity,filter;
        }

        /* right → left arrival */
        .introWord span:nth-child(1){animation-delay:.78s}
        .introWord span:nth-child(2){animation-delay:.66s}
        .introWord span:nth-child(3){animation-delay:.54s}
        .introWord span:nth-child(4){animation-delay:.42s}
        .introWord span:nth-child(5){animation-delay:.30s}
        .introWord span:nth-child(6){animation-delay:.18s}
        .introWord span:nth-child(7){animation-delay:.06s}

        .introSplash.isLeaving .introWord{
          animation:introWordToCorner .82s cubic-bezier(.76,0,.16,1) forwards;
        }

        .introSplash.isLeaving .introWord span{
          animation:none;
          opacity:1;
          filter:none;
          transform:none;
        }

        .introSplash.isLeaving{
          animation:introCurtain .82s cubic-bezier(.76,0,.16,1) .08s forwards;
        }

        @keyframes introLetter{
          0%{opacity:0;transform:translateX(105px) translateY(8px) scale(.9);filter:blur(4px)}
          48%{opacity:1;transform:translateX(-7px) translateY(0) scale(1.02);filter:blur(0)}
          72%{transform:translateX(2px) scale(.998)}
          100%{opacity:1;transform:translateX(0) translateY(0) scale(1);filter:blur(0)}
        }

        @keyframes introWordToCorner{
          0%{transform:translate(0,0) scale(1);opacity:1}
          72%{transform:translate(calc(-50vw + 88px),calc(-50vh + 58px)) scale(.40);opacity:1}
          100%{transform:translate(calc(-50vw + 74px),calc(-50vh + 50px)) scale(.34);opacity:0}
        }

        @keyframes introCurtain{
          0%{opacity:1;background:#fff}
          78%{opacity:1;background:#fff}
          100%{opacity:0;background:transparent;visibility:hidden}
        }

        @media(max-width:650px){
          .introWord{font-size:clamp(50px,16vw,82px)}
        }

        @media(prefers-reduced-motion:reduce){
          .introSplash{display:none!important}
        }
      `}</style>
    </div>
  )
}
