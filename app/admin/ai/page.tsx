'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase'
import { ADMIN_EMAIL } from '@/lib/config'

const modes = [
  ['improve', 'Improve'],
  ['shorten', 'Shorten'],
  ['premium', 'Premium'],
  ['seo', 'SEO'],
]

export default function AIWriter() {
  const sb = supabaseBrowser()
  const [checked, setChecked] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [productName, setProductName] = useState('')
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [mode, setMode] = useState('improve')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useState(() => {
    sb.auth.getUser().then(({ data }) => {
      setAllowed(data.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase())
      setChecked(true)
    })
  })

  async function rewrite() {
    if (!text.trim()) return setMessage('Paste a description first.')
    setBusy(true); setMessage(''); setResult('')
    try {
      const response = await fetch('/api/ai/rewrite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productName, text, mode }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Request failed')
      setResult(data.text || '')
    } catch (error: any) {
      setMessage(error?.message || 'Something went wrong.')
    } finally { setBusy(false) }
  }

  if (!checked) return <main className="aiPage"><div className="aiCard">Checking access…</div></main>
  if (!allowed) return <main className="aiPage"><div className="aiCard"><Link href="/admin">← Admin</Link><h1>AI Writer</h1><p>Admin access required.</p></div></main>

  return <main className="aiPage"><div className="aiWrap"><header><div><Link className="back" href="/admin">← Admin dashboard</Link><div className="eyebrow">AYUSHPICKS · AI WRITER</div><h1>Make product copy better.</h1><p>Paste retailer/source copy and turn it into concise, original AYUSHPICKS-style copy.</p></div></header>
    <section className="aiCard"><label>Product name<input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="e.g. Sony WH-CH520" /></label><label>Original description<textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste the product description here…" /></label><div className="modes">{modes.map(([value,label])=><button key={value} className={mode===value?'active':''} onClick={()=>setMode(value)}>{label}</button>)}</div><button className="generate" disabled={busy} onClick={rewrite}>{busy?'Writing…':'Enhance with AI'}</button>{message&&<p className="message">{message}</p>}</section>
    {result&&<section className="aiCard output"><div className="outputHead"><div><span className="eyebrow">RESULT</span><h2>Ready to use</h2></div><button onClick={()=>navigator.clipboard.writeText(result)}>Copy</button></div><p>{result}</p></section>}
    <p className="note">AI is instructed not to invent product facts. Always review the final copy before publishing.</p>
  </div><style jsx>{styles}</style></main>
}

const styles=`
.aiPage{min-height:100vh;background:var(--bg);color:var(--text);padding:36px 0 70px}.aiWrap{width:min(760px,calc(100% - 28px));margin:auto}.back{display:inline-block;color:var(--muted);font-size:12px;margin-bottom:28px}.eyebrow{font-size:10px;letter-spacing:.14em;color:var(--accent);font-weight:800}.aiPage h1{font:800 42px Manrope;letter-spacing:-.06em;margin:8px 0}.aiPage header p{color:var(--muted);max-width:620px;line-height:1.65;margin:0 0 24px}.aiCard{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:20px;margin-top:14px}.aiCard label{display:grid;gap:7px;color:var(--muted);font-size:12px;margin-bottom:15px}.aiCard input,.aiCard textarea{width:100%;box-sizing:border-box;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:11px;padding:12px;outline:none}.aiCard textarea{min-height:190px;resize:vertical;line-height:1.55}.modes{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}.modes button,.outputHead button{border:1px solid var(--line);background:var(--panel2);color:var(--muted);border-radius:9px;padding:8px 11px;font-size:11px}.modes button.active{color:var(--text);border-color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,var(--panel2))}.generate{width:100%;border:0;border-radius:11px;padding:12px;background:var(--accent);color:white;font-weight:800;cursor:pointer}.generate:disabled{opacity:.55}.message,.note{color:var(--muted);font-size:12px}.outputHead{display:flex;align-items:center;justify-content:space-between;gap:10px}.outputHead h2{margin:4px 0 12px;font:800 21px Manrope}.output p{line-height:1.7;margin:4px 0}.note{margin:14px 4px}@media(max-width:600px){.aiPage{padding-top:22px}.aiPage h1{font-size:31px}.aiCard{padding:15px;border-radius:15px}.aiCard textarea{min-height:160px}.aiWrap{width:min(100% - 20px,760px)}}`
