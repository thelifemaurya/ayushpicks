'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const ADSENSE_CLIENT = 'ca-pub-1101292617046429'

export default function AdSenseScript() {
  const pathname = usePathname()
  const allowAds = pathname === '/' || pathname === '/products' || pathname.startsWith('/products/') || pathname === '/guides' || pathname.startsWith('/guides/') || pathname === '/about'
  if (!allowAds) return null
  return <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} crossOrigin="anonymous" strategy="afterInteractive" />
}
