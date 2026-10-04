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
    <div className={`introSplash ${leaving ? 'isLeaving' : ''}`} aria-hidden="true">
      <div className="introWord">
        {letters.map((letter, index) => (
          <span key={letter} style={{ '--i': index } as React.CSSProperties}>{letter}</span>
        ))}
      </div>
      <Image className="introLogo" src="/ksnatic-logo.png" alt="" width={220} height={64} priority />
    </div>
  )
}
