import type { Metadata } from 'next'
import './globals.css'
import { SITE_URL } from '@/lib/config'
import AssistantWidget from '@/components/assistant-widget'
import AdSenseScript from '@/components/adsense-script'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'AYUSHPICKS — Discover better. Decide smarter.', template: '%s | AYUSHPICKS' },
  description: 'AYUSHPICKS helps you discover, understand, compare, and choose products worth considering before you buy.',
  applicationName: 'AYUSHPICKS',
  authors: [{ name: 'Ayush Maurya' }],
  creator: 'AYUSHPICKS',
  keywords: ['product discovery','product recommendations','buying guides','best products','Amazon India'],
  robots: { index: true, follow: true },
  other: { 'google-adsense-account': 'ca-pub-1101292617046429' },
  openGraph: {
    title: 'AYUSHPICKS — Discover better. Decide smarter.',
    description: 'Useful products, practical details and buying guides.',
    url: SITE_URL,
    siteName: 'AYUSHPICKS',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'AYUSHPICKS — Discover better. Decide smarter.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AYUSHPICKS — Discover better. Decide smarter.',
    description: 'Useful products, practical details and buying guides.',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="light"><body>{children}<AdSenseScript /><AssistantWidget /></body></html>
}
