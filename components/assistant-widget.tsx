'use client'

import { useEffect, useState } from 'react'
import { Bot, MessageCircle, Send, X } from 'lucide-react'

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<{ role:'assistant'|'user'; text:string }[]>([
    { role:'assistant', text:'Hi! I’m the AYUSHPICKS guide. Ask me where to find something or how the site works.' },
  ])

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) setOpen(false)
  }, [])

  async function send(text = input) {
    const value = text.trim()
    if (!value || busy) return
    setInput('')
    setMessages(m => [...m, { role:'user', text:value }])
    setBusy(true)
    try {
      const response = await fetch('/api/ai/assistant', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ message:value, pathname:window.location.pathname }),
      })
      const data = await response.json()
      setMessages(m => [...m, { role:'assistant', text:response.ok ? data.text : (data.error || 'Sorry, I could not help right now.') }])
    } catch {
      setMessages(m => [...m, { role:'assistant', text:'Sorry, I’m temporarily unavailable. Please try again.' }])
    } finally { setBusy(false) }
  }

  if (window.location.pathname.startsWith('/admin')) return null

  return <>
    {open && <div className="siteAssistantPanel">
      <div className="siteAssistantHead"><div><strong>AYUSHPICKS Guide</strong><span>Ask about the site</span></div><button onClick={()=>setOpen(false)} aria-label="Close assistant"><X size={17}/></button></div>
      <div className="siteAssistantMessages">
        {messages.map((m,i)=><div key={i} className={`siteAssistantMsg ${m.role}`}>{m.text}</div>)}
        {busy&&<div className="siteAssistantMsg assistant">Thinking…</div>}
      </div>
      {messages.length===1&&<div className="siteAssistantQuick"><button onClick={()=>send('Where can I find products?')}>Find products</button><button onClick={()=>send('Where are the buying guides?')}>Buying guides</button><button onClick={()=>send('How does AYUSHPICKS work?')}>How it works</button></div>}
      <form className="siteAssistantInput" onSubmit={e=>{e.preventDefault();send()}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask me anything about the site…" aria-label="Ask the site assistant" /><button disabled={busy||!input.trim()} aria-label="Send"><Send size={16}/></button></form>
    </div>}
    <button className={`siteAssistantFab ${open?'open':''}`} onClick={()=>setOpen(v=>!v)} aria-label={open?'Close site assistant':'Open site assistant'}>{open?<X size={22}/>:<><Bot size={21}/><span>Guide</span></>}</button>
    <style jsx>{`
      .siteAssistantFab{position:fixed;right:22px;bottom:22px;z-index:1000;border:1px solid var(--line);background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border-radius:999px;height:52px;padding:0 17px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:800;box-shadow:0 14px 38px rgba(0,0,0,.28);cursor:pointer}.siteAssistantFab.open{width:52px;padding:0}.siteAssistantPanel{position:fixed;right:22px;bottom:86px;z-index:999;width:min(380px,calc(100vw - 28px));height:min(560px,calc(100vh - 110px));display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.35);overflow:hidden}.siteAssistantHead{display:flex;justify-content:space-between;align-items:center;padding:15px 16px;border-bottom:1px solid var(--line)}.siteAssistantHead strong,.siteAssistantHead span{display:block}.siteAssistantHead strong{font:800 15px Manrope}.siteAssistantHead span{font-size:10px;color:var(--muted);margin-top:3px}.siteAssistantHead button{border:0;background:transparent;color:var(--muted);cursor:pointer}.siteAssistantMessages{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:9px}.siteAssistantMsg{max-width:88%;padding:10px 12px;border-radius:13px;font-size:12px;line-height:1.55;white-space:pre-wrap}.siteAssistantMsg.assistant{align-self:flex-start;background:var(--panel2);color:var(--text)}.siteAssistantMsg.user{align-self:flex-end;background:var(--accent);color:#fff}.siteAssistantQuick{display:flex;gap:6px;overflow:auto;padding:0 12px 10px}.siteAssistantQuick button{white-space:nowrap;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:7px 9px;font-size:10px;cursor:pointer}.siteAssistantInput{display:flex;gap:7px;padding:10px;border-top:1px solid var(--line)}.siteAssistantInput input{flex:1;min-width:0;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:11px;padding:10px 11px;outline:none;font-size:12px}.siteAssistantInput button{width:39px;border:0;border-radius:10px;background:var(--accent);color:#fff;display:grid;place-items:center;cursor:pointer}.siteAssistantInput button:disabled{opacity:.45;cursor:not-allowed}@media(max-width:600px){.siteAssistantFab{right:14px;bottom:14px}.siteAssistantPanel{right:14px;bottom:76px;width:calc(100vw - 28px);height:min(570px,calc(100vh - 95px));border-radius:17px}}
    `}</style>
  </>
}
