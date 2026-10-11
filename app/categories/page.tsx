import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageShell } from '@/components/site'
import { supabaseServer } from '@/lib/supabase-server'

export const revalidate = 60

const icons:Record<string,string>={Accessories:'👜',Beauty:'✦',Electronics:'◈',Fashion:'◌',Gaming:'⌁',Home:'⌂',Kitchen:'◒',Other:'＋'}

export default async function Categories(){
  const { data } = await supabaseServer().from('categories').select('*').order('name')
  const categories=data||[]
  return <PageShell title="" kicker="" compactHero>
    <section className="categoriesPageHero">
      <div className="eyebrow">BROWSE BY CATEGORY</div>
      <h1>Categories</h1>
      <p>Start broad, then narrow down when you know what you want. All products stays available whenever you want the full collection.</p>
    </section>
    <section className="categoryDirectory" aria-label="Product categories">
      <Link href="/products" className="categoryDirectoryItem all"><span className="categoryDirectoryIcon">All</span><span><strong>All products</strong><small>Browse every published pick</small></span><ArrowRight size={17}/></Link>
      {categories.map((c:any)=><Link key={c.id} href={'/products?category='+encodeURIComponent(c.id)} className="categoryDirectoryItem"><span className="categoryDirectoryIcon">{icons[c.name]||'✦'}</span><span><strong>{c.name}</strong><small>Explore {c.name.toLowerCase()} picks</small></span><ArrowRight size={17}/></Link>)}
    </section>

  </PageShell>
}
