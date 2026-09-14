'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase'
import { ADMIN_EMAIL } from '@/lib/config'

type Generated = { short_description:string; why_picked:string; pros:string[]; cons:string[]; tags:string[] }

export default function AIWriter() {
  const sb = supabaseBrowser()
  const [checked, setChecked] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [productName, setProductName] = useState('')
  const [source, setSource] = useState('')
  const [affiliateUrl, setAffiliateUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [price, setPrice] = useState('')
  const [oldPrice, setOldPrice] = useState('')
  const [generated, setGenerated] = useState<Generated | null>(null)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => { setUser(data.user); setAllowed(data.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()); setChecked(true) })
  }, [sb])

  async function generate() {
    if (!productName.trim() || !source.trim()) return setMessage('Add the product name and paste the source description first.')
    setBusy(true); setMessage(''); setGenerated(null)
    try {
      const response = await fetch('/api/ai/product', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ productName, source }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Generation failed')
      setGenerated(data)
    } catch (error:any) { setMessage(error?.message || 'Something went wrong.') }
    finally { setBusy(false) }
  }

  function slugify(value:string) { return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\\s-]/g,'').trim().replace(/[\\s_-]+/g,'-').replace(/^-+|-+$/g,'') }

  async function saveDraft() {
    if (!generated || !productName.trim() || !affiliateUrl.trim()) return setMessage('Add the affiliate URL before saving.')
    setSaving(true); setMessage('')
    const slug = `${slugify(productName)}-${Date.now().toString().slice(-6)}`
    const { error } = await sb.from('products').insert({
      name:productName.trim(), slug, store:'Amazon', affiliate_url:affiliateUrl.trim(), image_url:imageUrl.trim() || null,
      price:price ? Number(price) : null, old_price:oldPrice ? Number(oldPrice) : null,
      short_description:generated.short_description || null, why_picked:generated.why_picked || null,
      pros:generated.pros, cons:generated.cons, tags:generated.tags, published:false, featured:false,
    })
    setMessage(error?.message || 'Product saved as draft. Open Admin to review and publish.')
    if (!error) setGenerated(null)
    setSaving(false)
  }

  if (!checked) return <main className="aiPage"><div className="aiCard">Checking access…</div></main>
  if (!allowed) return <main className="aiPage"><div className="aiCard"><Link href="/admin">← Admin</Link><h1>AI Product Builder</h1><p>Admin access required.</p></div></main>

  return <main className="aiPage"><div className="aiWrap">
    <header><Link className="back" href="/admin">← Admin dashboard</Link><div className="eyebrow">AYUSHPICKS · AI PRODUCT BUILDER</div><h1>Build a product pick automatically.</h1><p>Paste the product information once. AI creates the short description, why we picked it, pros, cons and tags. You review everything before publishing.</p></header>

    <section className="aiCard"><h2>1 · Product details</h2>
      <label>Product name<input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="e.g. Sony WH-CH520" /></label>
      <label>Affiliate URL<input value={affiliateUrl} onChange={e=>setAffiliateUrl(e.target.value)} placeholder="Paste your Amazon affiliate URL" /></label>
      <label>Image URL<input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="Direct .jpg / .png / .webp URL" /></label>
      <div className="two"><label>Price (₹)<input value={price} onChange={e=>setPrice(e.target.value)} inputMode="decimal" /></label><label>Old price (₹)<input value={oldPrice} onChange={e=>setOldPrice(e.target.value)} inputMode="decimal" /></label></div>
      <label>Source product information<textarea value={source} onChange={e=>setSource(e.target.value)} placeholder="Paste the product description/specifications here…" /></label>
      <button type="button" className="generate" disabled={busy} onClick={generate}>{busy?'Generating everything…':'✨ Generate product content'}</button>
      {message&&<p className="message">{message}</p>}
    </section>

    {generated&&<section className="aiCard"><div className="resultHead"><div><div className="eyebrow">2 · AI OUTPUT</div><h2>Review before saving</h2></div></div>
      <label>Short description<textarea value={generated.short_description} onChange={e=>setGenerated({...generated,short_description:e.target.value})}/></label>
      <label>Why we picked it<textarea value={generated.why_picked} onChange={e=>setGenerated({...generated,why_picked:e.target.value})}/></label>
      <div className="two"><label>Pros<textarea value={generated.pros.join('\\n')} onChange={e=>setGenerated({...generated,pros:e.target.value.split('\\n').map(x=>x.trim()).filter(Boolean)})}/><small>One point per line</small></label><label>Cons<textarea value={generated.cons.join('\\n')} onChange={e=>setGenerated({...generated,cons:e.target.value.split('\\n').map(x=>x.trim()).filter(Boolean)})}/><small>One point per line</small></label></div>
      <label>Tags<input value={generated.tags.join(', ')} onChange={e=>setGenerated({...generated,tags:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)})}/></label>
      <button type="button" className="generate" disabled={saving} onClick={saveDraft}>{saving?'Saving…':'Save as draft'}</button>
      <p className="note">AI only uses the source information you provide. Check the facts and wording before publishing.</p>
    </section>}
  </div><style jsx>{styles}</style></main>
}

const styles=`
.aiPage{min-height:100vh;background:var(--bg);color:var(--text);padding:36px 0 70px}.aiWrap{width:min(760px,calc(100% - 28px));margin:auto}.back{display:inline-block;color:var(--muted);font-size:12px;margin-bottom:28px}.eyebrow{font-size:10px;letter-spacing:.14em;color:var(--accent);font-weight:800}.aiPage h1{font:800 42px Manrope;letter-spacing:-.06em;margin:8px 0}.aiPage header p{color:var(--muted);max-width:650px;line-height:1.65;margin:0 0 24px}.aiCard{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:20px;margin-top:14px}.aiCard h2{font:800 20px Manrope;margin:0 0 16px}.aiCard label{display:grid;gap:7px;color:var(--muted);font-size:12px;margin-bottom:15px}.aiCard input,.aiCard textarea{width:100%;box-sizing:border-box;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:11px;padding:12px;outline:none}.aiCard textarea{min-height:110px;resize:vertical;line-height:1.55}.aiCard label:first-of-type textarea{min-height:140px}.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.generate{width:100%;border:0;border-radius:11px;padding:13px;background:var(--accent);color:white;font-weight:800;cursor:pointer}.generate:disabled{opacity:.55}.message,.note,.aiCard small{color:var(--muted);font-size:12px}.resultHead{margin-bottom:15px}@media(max-width:600px){.aiPage{padding-top:22px}.aiPage h1{font-size:31px}.aiCard{padding:15px;border-radius:15px}.two{grid-template-columns:1fr}.aiWrap{width:min(100% - 20px,760px)}}`
