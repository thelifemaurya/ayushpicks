export default function AffiliateDisclosure({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={compact ? 'affiliateDisclosure compact' : 'affiliateDisclosure'} aria-label="Affiliate disclosure">
      <strong>Affiliate disclosure</strong>
      <p>KSNATIC is a reader-supported platform. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.</p>
    </aside>
  )
}