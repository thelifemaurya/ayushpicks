'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase'
import { ADMIN_EMAIL, SITE_URL } from '@/lib/config'

const emptyForm = { name:'', affiliate_url:'', image_url:'', price:'', old_price:'', category_id:'', short_description:'', why_picked:'', pros:'', cons:'', tags:'', published:false, featured:false }

export default function Admin() {
  const sb = supabaseBrowser()
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [sent, setSent] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<string|null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      loadProducts()
      sb.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []))
    }
  }, [user])

  async function login() {
    setBusy(true); setMessage(''); setSent(false)
    const redirectTo = `${SITE_URL}/auth/callback?next=/admin`
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo, shouldCreateUser: false } })
    setMessage(error?.message || 'Magic link sent. Check your email.')
    setSent(!error); setBusy(false)
  }

  async function loadProducts() {
    const { data } = await sb.from('products').select('*').order('created_at', { ascending:false })
    setProducts(data || [])
  }

  function slugify(value:string) {
    return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g,'').trim().replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'')
  }

  function startEdit(product:any) {
    setEditing(product.id)
    setForm({
      name: product.name || '', affiliate_url: product.affiliate_url || '', image_url: product.image_url || '',
      price: product.price?.toString() || '', old_price: product.old_price?.toString() || '', category_id: product.category_id || '',
      short_description: product.short_description || '', why_picked: product.why_picked || '',
      pros: Array.isArray(product.pros) ? product.pros.join('\n') : '', cons: Array.isArray(product.cons) ? product.cons.join('\n') : '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '', published: !!product.published, featured: !!product.featured,
    })
    setMessage('')
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  function reset() { setEditing(null); setForm(emptyForm); setMessage('') }

  async function generateWithAI() {
    setMessage('')
    if (!form.name.trim()) { setMessage('Enter the product name first.'); return }
    const source = [
      `Product name: ${form.name.trim()}`,
      form.short_description.trim() ? `Current description: ${form.short_description.trim()}` : '',
      form.why_picked.trim() ? `Current editorial note: ${form.why_picked.trim()}` : '',
      form.affiliate_url.trim() ? `Product/listing URL: ${form.affiliate_url.trim()}` : '',
    ].filter(Boolean).join('\n\n')
    setAiBusy(true)
    try {
      const res = await fetch('/api/ai/product', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ productName:form.name.trim(), source }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'AI generation failed.')
      setForm(prev => ({ ...prev,
        short_description: data.short_description || prev.short_description,
        why_picked: data.why_picked || prev.why_picked,
        pros: Array.isArray(data.pros) ? data.pros.join('\n') : prev.pros,
        cons: Array.isArray(data.cons) ? data.cons.join('\n') : prev.cons,
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : prev.tags,
      }))
      setMessage('AI filled the fields. Review everything before saving or publishing.')
    } catch (error:any) {
      setMessage(error?.message || 'AI generation failed. Please try again.')
    } finally { setAiBusy(false) }
  }

  async function save() {
    setMessage('')
    if (!form.name.trim() || !form.affiliate_url.trim()) { setMessage('Product name and affiliate URL are required.'); return }
    setBusy(true)
    const payload = {
      name: form.name.trim(), slug: editing ? products.find(p => p.id === editing)?.slug || `${slugify(form.name)}-${Date.now().toString().slice(-6)}` : `${slugify(form.name)}-${Date.now().toString().slice(-6)}`,
      affiliate_url: form.affiliate_url.trim(), image_url: form.image_url.trim() || null,
      price: form.price ? Number(form.price) : null, old_price: form.old_price ? Number(form.old_price) : null,
      category_id: form.category_id || null, short_description: form.short_description.trim() || null,
      why_picked: form.why_picked.trim() || null,
      pros: form.pros.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,5), cons: form.cons.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,3),
      tags: form.tags.split(',').map(x=>x.trim()).filter(Boolean).slice(0,8),
      published: form.published, featured: form.featured, store:'Amazon',
    }
    const result = editing ? await sb.from('products').update(payload).eq('id', editing) : await sb.from('products').insert(payload)
    setMessage(result.error?.message || (editing ? 'Product updated.' : 'Product added.'))
    if (!result.error) { reset(); await loadProducts() }
    setBusy(false)
  }

  async function remove(id:string) {
    if (!confirm('Delete this product?')) return
    setBusy(true); const { error } = await sb.from('products').delete().eq('id', id)
    setMessage(error?.message || 'Product deleted.'); await loadProducts(); setBusy(false)
  }

  async function togglePublished(product:any) {
    const { error } = await sb.from('products').update({ published:!product.published }).eq('id', product.id)
    setMessage(error?.message || (product.published ? 'Moved to draft.' : 'Published.')); await loadProducts()
  }

  if (!user) return <main className="admin"><div className="adminWrap"><div className="adminLogin"><Link className="brand" href="/">AYUSH<span>PICKS</span></Link><div className="eyebrow">PRIVATE ADMIN</div><h1>Sign in</h1><p className="muted small">Only the AYUSHPICKS owner account can manage products.</p><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" /></label><button disabled={busy} className="btn primary full" onClick={login}>{busy?'Sending…':sent?'Link sent':'Send magic link'}</button>{message&&<p className="status">{message}</p>}</div></div><style jsx>{styles}</style></main>

  if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return <main className="admin"><div className="adminWrap"><div className="notice">This account is signed in, but it is not authorized to manage AYUSHPICKS.</div></div><style jsx>{styles}</style></main>

  return <main className="admin"><div className="adminWrap"><header className="adminbar"><div><Link className="brand" href="/">AYUSH<span>PICKS</span></Link><div className="muted small">Content dashboard</div></div><div className="adminActions"><Link className="btn" href="/">View site</Link><button className="btn" onClick={()=>sb.auth.signOut()}>Sign out</button></div></header>
    <div className="stats"><div className="stat"><span>TOTAL</span><strong>{products.length}</strong></div><div className="stat"><span>PUBLISHED</span><strong>{products.filter(p=>p.published).length}</strong></div><div className="stat"><span>CLICKS</span><strong>{products.reduce((n,p)=>n+Number(p.click_count||0),0)}</strong></div></div>
    <div className="dashboard"><section className="panel"><div className="sectionhead"><div><span className="kicker">CONTENT</span><h2>{editing?'Edit product':'Add product'}</h2><p className="muted small">Add a pick manually, or let AI prepare the editorial fields.</p></div>{editing&&<button className="btn" onClick={reset}>Cancel</button>}</div>
      <div className="form"><div className="field"><label>Product name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Maybelline Lifter Gloss" /></label></div><div className="field"><label>Affiliate URL<input value={form.affiliate_url} onChange={e=>setForm({...form,affiliate_url:e.target.value})} placeholder="https://…" /></label></div><div className="field"><label>Image URL<input value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="Direct .jpg / .png / .webp URL" /></label>{form.image_url&&<div className="preview"><img src={form.image_url} alt="Product preview" referrerPolicy="no-referrer" onError={e=>{e.currentTarget.style.display='none';e.currentTarget.parentElement?.classList.add('failed')}} /><span>Preview</span></div>}<small>Use the actual image URL, not the Amazon product-page URL.</small></div><div className="two"><div className="field"><label>Price (₹)<input value={form.price} onChange={e=>setForm({...form,price:e.target.value})} inputMode="decimal" /></label></div><div className="field"><label>Old price (₹)<input value={form.old_price} onChange={e=>setForm({...form,old_price:e.target.value})} inputMode="decimal" /></label></div></div><div className="field"><label>Category<select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">No category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
      <div className="aiBox"><div><strong>✦ AI Product Writer</strong><span>Generate description, why picked, pros, cons & tags from the information you've entered.</span></div><button disabled={aiBusy||busy} className="btn primary" onClick={generateWithAI}>{aiBusy?'Generating…':'Generate with AI'}</button></div>
      <div className="field"><label>Short description<textarea value={form.short_description} onChange={e=>setForm({...form,short_description:e.target.value})} placeholder="What this product is useful for…" /></label></div><div className="field"><label>Why we picked it<textarea value={form.why_picked} onChange={e=>setForm({...form,why_picked:e.target.value})} placeholder="Your original editorial reasoning…" /></label></div><div className="two"><div className="field"><label>Pros <small>One per line</small><textarea value={form.pros} onChange={e=>setForm({...form,pros:e.target.value})} placeholder="Lightweight\nEasy to use" /></label></div><div className="field"><label>Cons <small>One per line</small><textarea value={form.cons} onChange={e=>setForm({...form,cons:e.target.value})} placeholder="May not suit everyone" /></label></div></div><div className="field"><label>Tags <small>Comma separated</small><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="beauty, skincare, budget" /></label></div><div className="checks"><label><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})} /> Published</label><label><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})} /> Featured</label></div><button disabled={busy||aiBusy} className="btn primary full" onClick={save}>{busy?'Saving…':editing?'Update product':'Add product'}</button>{message&&<div className="status">{message}</div>}</div></section>
      <section className="panel"><div className="sectionhead"><div><span className="kicker">LIBRARY</span><h2>Products</h2><p className="muted small">Manage your live picks.</p></div></div><div className="productlist">{products.map(p=><div className="productrow" key={p.id}><div className="thumb">{p.image_url?<img src={p.image_url} alt="" referrerPolicy="no-referrer" onError={e=>e.currentTarget.style.display='none'} />:<span>—</span>}</div><div className="rowinfo"><strong>{p.name}</strong><span>{p.published?'Published':'Draft'} · {p.store||'Amazon'} · {Number(p.click_count||0)} clicks</span></div><div className="rowactions"><button className="btn" onClick={()=>startEdit(p)}>Edit</button><button className="btn" onClick={()=>togglePublished(p)}>{p.published?'Draft':'Publish'}</button><button className="btn danger" onClick={()=>remove(p.id)}>Delete</button></div></div>)}{!products.length&&<div className="empty">No products yet. Add your first pick.</div>}</div></section></div></div><style jsx>{styles}</style></main>
}

const styles=`
.admin{min-height:100vh;background:var(--bg);color:var(--text);padding:28px 0 60px}.adminWrap{width:min(1200px,calc(100% - 32px));margin:auto}.adminLogin{width:min(460px,100%);margin:9vh auto 0;background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:28px}.adminLogin .eyebrow{margin-top:24px}.adminLogin h1{font:800 38px Manrope;letter-spacing:-.06em;margin:12px 0}.adminLogin>label{display:grid;gap:7px;font-size:12px;color:var(--muted);margin-top:22px}.adminLogin input{width:100%;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:12px;outline:none}.adminbar{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px}.adminActions{display:flex;gap:8px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px}.stat,.panel{background:var(--panel);border:1px solid var(--line);border-radius:18px}.stat{padding:16px 18px}.stat span{font-size:10px;letter-spacing:.12em;color:var(--muted);font-weight:800}.stat strong{display:block;font:800 30px Manrope;margin-top:5px}.dashboard{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:12px;align-items:start}.panel{padding:20px;min-width:0}.sectionhead{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:20px}.kicker{font-size:10px;letter-spacing:.13em;color:var(--accent);font-weight:800}.sectionhead h2{font:800 25px Manrope;letter-spacing:-.045em;margin:5px 0}.sectionhead p{margin:0}.form{display:grid;gap:13px}.field{min-width:0}.field>label{display:grid;gap:7px;font-size:12px;color:var(--muted)}.field input,.field textarea,.field select{width:100%;min-width:0;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:11px 12px;outline:none}.field textarea{min-height:100px;resize:vertical}.field small{display:block;color:var(--muted);font-size:9px;margin-top:7px}.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.checks{display:flex;gap:18px;flex-wrap:wrap;color:var(--muted);font-size:12px}.full{width:100%}.aiBox{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px;border:1px solid var(--line);border-radius:12px;background:var(--panel2)}.aiBox strong{display:block;color:var(--text);font-size:12px}.aiBox span{display:block;color:var(--muted);font-size:10px;margin-top:3px}.aiBox .btn{white-space:nowrap}.preview{height:170px;margin-top:8px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.preview img{width:100%;height:100%;object-fit:contain}.preview span{position:absolute;bottom:6px;left:7px;font-size:9px;background:var(--panel);padding:3px 6px;border-radius:5px;color:var(--muted)}.preview.failed:after{content:'Image could not be loaded';font-size:11px;color:var(--muted);text-align:center;padding:15px}.status{font-size:12px;color:var(--muted)}.productlist{display:grid;gap:8px}.productrow{display:grid;grid-template-columns:52px minmax(0,1fr);gap:10px;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);min-width:0}.thumb{width:52px;height:52px;border-radius:9px;background:var(--panel);display:grid;place-items:center;overflow:hidden;color:var(--muted)}.thumb img{width:100%;height:100%;object-fit:contain}.rowinfo{min-width:0}.rowinfo strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px}.rowinfo span{display:block;color:var(--muted);font-size:10px;margin-top:3px}.rowactions{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.rowactions .btn{width:100%;padding:9px 5px;font-size:10px}.danger{color:#ff8f9b;border-color:#52262d}.notice{padding:14px;border:1px solid var(--line);background:var(--panel);border-radius:12px;color:var(--muted)}.empty{padding:30px;text-align:center;color:var(--muted)}
@media(min-width:901px){.rowactions{grid-column:auto;display:flex;justify-content:flex-end}.rowactions .btn{width:auto;padding:9px 11px;font-size:11px}}
@media(max-width:900px){.admin{padding:16px 0 40px}.adminWrap{width:min(100% - 22px,1200px)}.dashboard{grid-template-columns:1fr}.panel{padding:15px;border-radius:15px}.adminbar{margin-bottom:16px}.adminActions .btn{padding:9px 10px;font-size:11px}.stat{padding:13px}.stat strong{font-size:23px}.sectionhead h2{font-size:21px}.aiBox{align-items:flex-start;flex-direction:column}.aiBox .btn{width:100%}}
@media(max-width:560px){.adminbar{align-items:flex-start}.adminbar .brand{font-size:19px}.adminActions{gap:5px}.adminActions .btn{font-size:10px;padding:8px}.stats{gap:7px}.stat{padding:11px}.stat span{font-size:8px}.stat strong{font-size:20px}.two{grid-template-columns:1fr}.field input,.field textarea,.field select{font-size:14px;padding:12px}.preview{height:145px}.adminLogin{padding:20px;border-radius:17px}}
`