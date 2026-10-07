import { PageShell } from '@/components/site'
import SearchPanel from '@/components/search-panel'
import { supabaseServer } from '@/lib/supabase-server'

export const revalidate = 60

export default async function SearchPage(){
  const sb=supabaseServer()
  const [{data:products},{data:categories}]=await Promise.all([
    sb.from('products').select('name,slug').eq('published',true).order('name'),
    sb.from('categories').select('id,name').order('name'),
  ])
  const items=[
    ...(products||[]).map((p:any)=>({name:p.name,slug:p.slug,category:null})),
    ...(categories||[]).map((c:any)=>({name:c.name,slug:'category-'+c.id,category:'Category',href:'/products?category='+encodeURIComponent(c.id)})),
  ]
  return <PageShell title="" kicker="" compactHero>
    <section className="searchPageHero"><div className="eyebrow">SEARCH AYUSHPICKS</div><h1>Find a product faster.</h1><p>Type a product, brand or category. Suggestions stay short and relevant, with a quick correction when a word is misspelled.</p></section>
    <SearchPanel items={items}/>
  </PageShell>
}
