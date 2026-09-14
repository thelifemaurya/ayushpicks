'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('ayushpicks-theme')
    const isDark = saved !== 'light'
    setDark(isDark)
    document.documentElement.classList.toggle('light', !isDark)
  }, [])

  function toggle() {
    const nextDark = !dark
    setDark(nextDark)
    document.documentElement.classList.toggle('light', !nextDark)
    localStorage.setItem('ayushpicks-theme', nextDark ? 'dark' : 'light')
  }

  return (
    <button className="themeToggle" onClick={toggle} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}
