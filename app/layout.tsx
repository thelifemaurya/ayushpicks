import type { Metadata } from 'next'
import './globals.css'
import { SITE_URL } from '@/lib/config'
import AssistantWidget from '@/components/assistant-widget'
import AdSenseScript from '@/components/adsense-script'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'AYUSHPICKS — Products worth picking', template: '%s | AYUSHPICKS' },
  description: 'Discover useful, well-picked products worth buying online. Compare products, read practical guides, and make better buying decisions.',
  applicationName: 'AYUSHPICKS',
  authors: [{ name: 'Ayush Mourya' }],
  creator: 'AYUSHPICKS',
  keywords: ['product discovery','product recommendations','buying guides','best products','Amazon India'],
  robots: { index: true, follow: true },
  openGraph: { title: 'AYUSHPICKS — Products worth picking', description: 'Useful products, practical details and buying guides.', url: SITE_URL, siteName: 'AYUSHPICKS', type: 'website' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<AdSenseScript /><AssistantWidget /></body></html>
}
