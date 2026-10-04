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

    const exitTimer = window.setTimeout(() => setLeaving(true), 2400)
    const doneTimer = window.setTimeout(() => setVisible(false), 3550)

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
          transform-origin:center center;
          will-change:transform;
        }

        .introWord span{
          display:inline-block;
          opacity:0;
          transform:translate3d(72px,0,0);
          animation:introLetter .72s cubic-bezier(.16,1,.3,1) forwards;
          animation-delay:calc((6 - var(--i)) * .095s);
          will-change:transform,opacity;
        }

        .introSplash.isLeaving .introWord{
          animation:introWordToCorner 1.08s cubic-bezier(.76,0,.16,1) forwards;
        }

        .introSplash.isLeaving .introWord span{
          animation:none;
          opacity:1;
          transform:none;
        }

        .introSplash.isLeaving{
          animation:introCurtain 1.08s cubic-bezier(.76,0,.16,1) forwards;
        }

        @keyframes introLetter{
          0%{
            opacity:0;
            transform:translate3d(72px,0,0);
          }
          65%{
            opacity:1;
            transform:translate3d(-3px,0,0);
          }
          100%{
            opacity:1;
            transform:translate3d(0,0,0);
          }
        }

        @keyframes introWordToCorner{
          0%{
            transform:translate3d(0,0,0) scale(1);
          }
          58%{
            transform:translate3d(calc(-50vw + 92px),calc(-50vh + 60px),0) scale(.46);
          }
          82%{
            transform:translate3d(calc(-50vw + 80px),calc(-50vh + 52px),0) scale(.36);
          }
          100%{
            transform:translate3d(calc(-50vw + 76px),calc(-50vh + 49px),0) scale(.34);
          }
        }

        @keyframes introCurtain{
          0%,78%{
            opacity:1;
            background:#fff;
          }
          100%{
            opacity:0;
            background:transparent;
            visibility:hidden;
          }
        }

        @media(max-width:650px){
          .introWord{font-size:clamp(50px,16vw,82px)}
          @keyframes introWordToCorner{
            0%{transform:translate3d(0,0,0) scale(1)}
            58%{transform:translate3d(calc(-50vw + 70px),calc(-50vh + 46px),0) scale(.46)}
            82%{transform:translate3d(calc(-50vw + 60px),calc(-50vh + 39px),0) scale(.36)}
            100%{transform:translate3d(calc(-50vw + 56px),calc(-50vh + 36px),0) scale(.34)}
          }
        }

        @media(prefers-reduced-motion:reduce){
          .introSplash{display:none!important}
        }
      `}</style>
    </div>
  )
}
