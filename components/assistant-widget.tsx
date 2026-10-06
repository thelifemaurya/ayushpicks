'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Send, X, ArrowRight, Move } from 'lucide-react'

type Product={id:string;name:string;slug:string;image_url:string|null;price:number|null;old_price:number|null;currency:string|null;short_description:string|null;rating:number|null}
type Message={role:'assistant'|'user';text:string;products?:Product[];action?:string}
type Point={x:number;y:number}

export default function AssistantWidget(){
 const [mounted,setMounted]=useState(false),[open,setOpen]=useState(false),[input,setInput]=useState(''),[busy,setBusy]=useState(false)
 const [position,setPosition]=useState<Point|null>(null)
 const dragRef=useRef({dragging:false,moved:false,startX:0,startY:0,originX:0,originY:0})
 const [messages,setMessages]=useState<Message[]>([{role:'assistant',text:'Hey! I can help you find products, compare picks and choose something by budget or use-case. What are you looking for?'}])

 useEffect(()=>{
  setMounted(true)
  try{
   const saved=localStorage.getItem('ayushpicks-guide-position')
   if(saved)setPosition(JSON.parse(saved))
  }catch{}
 },[])

 useEffect(()=>{
  if(position)try{localStorage.setItem('ayushpicks-guide-position',JSON.stringify(position))}catch{}
 },[position])

 useEffect(()=>{
  const move=(e:PointerEvent)=>{
   const d=dragRef.current
   if(!d.dragging)return
   const dx=e.clientX-d.startX,dy=e.clientY-d.startY
   if(Math.abs(dx)+Math.abs(dy)>5)d.moved=true
   if(!d.moved)return
   const size=58,gap=10
   const x=Math.min(Math.max(gap,d.originX+dx),window.innerWidth-size-gap)
   const y=Math.min(Math.max(gap,d.originY+dy),window.innerHeight-size-gap)
   setPosition({x,y})
  }
  const up=()=>{
   const d=dragRef.current
   if(!d.dragging)return
   d.dragging=false
   if(d.moved)window.setTimeout(()=>{dragRef.current.moved=false},0)
  }
  window.addEventListener('pointermove',move)
  window.addEventListener('pointerup',up)
  return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up)}
 },[])

 async function send(text=input){
  const value=text.trim();if(!value||busy)return
  setInput('');setMessages(m=>[...m,{role:'user',text:value}]);setBusy(true)
  try{const r=await fetch('/api/ai/shop',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:value})});const d=await r.json();setMessages(m=>[...m,{role:'assistant',text:r.ok?d.text:(d.error||'Sorry, I could not help right now.'),products:r.ok?d.products:[],action:r.ok?d.action:'none'}])}
  catch{setMessages(m=>[...m,{role:'assistant',text:'Sorry, I’m temporarily unavailable. Please try again.'}])}
  finally{setBusy(false)}
 }

 if(!mounted||window.location.pathname.startsWith('/admin'))return null

 const fabStyle=position?{left:position.x,top:position.y,right:'auto',bottom:'auto'}:undefined

 function pointerDown(e:React.PointerEvent<HTMLButtonElement>){
  const r=e.currentTarget.getBoundingClientRect()
  dragRef.current={dragging:true,moved:false,startX:e.clientX,startY:e.clientY,originX:r.left,originY:r.top}
  e.currentTarget.setPointerCapture?.(e.pointerId)
 }
 function clickFab(){
  if(dragRef.current.moved){dragRef.current.moved=false;return}
  setOpen(v=>!v)
 }

 return <>
  {open&&<div className="siteAssistantPanel">
   <div className="siteAssistantHead">
    <div><strong>AYUSHPICKS Guide</strong><span>Find • Compare • Choose</span></div>
    <button onClick={()=>setOpen(false)} aria-label="Close assistant"><X size={17}/></button>
   </div>
   <div className="siteAssistantMessages">
    {messages.map((m,i)=><div key={i} className="siteAssistantGroup">
     <div className={`siteAssistantMsg ${m.role}`}>{m.text}</div>
     {m.products&&m.products.length>0&&<div className="siteAssistantProducts">{m.products.map(p=><a className="siteAssistantProduct" href={`/products/${p.slug}`} key={p.id}><div className="siteAssistantProductImg">{p.image_url?<img src={p.image_url} alt=""/>:<span>No image</span>}</div><div className="siteAssistantProductInfo"><strong>{p.name}</strong>{p.price!=null&&<b>{p.currency||'₹'}{Number(p.price).toLocaleString('en-IN')}</b>}{p.rating!=null&&<small>★ {p.rating}</small>}<span>View product <ArrowRight size={11}/></span></div></a>)}</div>}
     {m.action==='discover'&&<a className="siteAssistantAction" href="/products">Browse all products <ArrowRight size={13}/></a>}
     {m.action==='guides'&&<a className="siteAssistantAction" href="/guides">Open buying guides <ArrowRight size={13}/></a>}
    </div>)}
    {busy&&<div className="siteAssistantMsg assistant">Finding the best matches…</div>}
   </div>
   {messages.length===1&&<div className="siteAssistantQuick"><button onClick={()=>send('Show me the best products under ₹1000')}>Under ₹1,000</button><button onClick={()=>send('I need something for gaming')}>For gaming</button><button onClick={()=>send('Show me beauty products')}>Beauty</button></div>}
   <form className="siteAssistantInput" onSubmit={e=>{e.preventDefault();send()}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="What are you looking for?" aria-label="Ask AYUSHPICKS Guide"/><button disabled={busy||!input.trim()} aria-label="Send"><Send size={16}/></button></form>
  </div>}

  <button
   className={`siteAssistantFab ${open?'open':''}`}
   style={fabStyle}
   onPointerDown={pointerDown}
   onClick={clickFab}
   aria-label={open?'Close Guide':'Open Guide'}
   title="Drag to move • Tap to open"
  >
   {open?<X size={21}/>:<Bot size={24}/>}
   <span className="siteAssistantMoveHint" aria-hidden="true"><Move size={9}/></span>
  </button>

  <style jsx>{`
   .siteAssistantFab{position:fixed;right:22px;bottom:22px;z-index:1300;width:58px;height:58px;padding:0;border:1px solid rgba(255,255,255,.38);background:#151515;color:#fff;border-radius:19px;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 35px rgba(0,0,0,.2);cursor:grab;touch-action:none;transition:transform .18s ease,box-shadow .18s ease}.siteAssistantFab:active{cursor:grabbing}.siteAssistantFab:hover{transform:translateY(-2px)}.siteAssistantFab.open{background:#111;border-radius:50%}.siteAssistantMoveHint{position:absolute;right:4px;bottom:4px;width:15px;height:15px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#111;border:1px solid #111}.siteAssistantPanel{position:fixed;right:22px;bottom:92px;z-index:1299;width:min(410px,calc(100vw - 28px));height:min(620px,calc(100vh - 115px));display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:24px;box-shadow:0 24px 70px rgba(0,0,0,.28);overflow:hidden}.siteAssistantHead{display:flex;justify-content:space-between;align-items:center;padding:16px 17px;border-bottom:1px solid var(--line)}.siteAssistantHead strong,.siteAssistantHead span{display:block}.siteAssistantHead strong{font:800 15px var(--display-font)}.siteAssistantHead span{font-size:10px;color:var(--muted);margin-top:3px}.siteAssistantHead button{border:0;background:transparent;color:var(--muted);cursor:pointer}.siteAssistantMessages{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:12px}.siteAssistantGroup{display:flex;flex-direction:column;gap:7px}.siteAssistantMsg{max-width:88%;padding:10px 12px;border-radius:13px;font-size:12px;line-height:1.55;white-space:pre-wrap}.siteAssistantMsg.assistant{align-self:flex-start;background:var(--panel2);color:var(--text)}.siteAssistantMsg.user{align-self:flex-end;background:var(--text);color:var(--bg)}.siteAssistantProducts{display:flex;flex-direction:column;gap:7px}.siteAssistantProduct{display:flex;gap:10px;padding:8px;border:1px solid var(--line);border-radius:13px;background:var(--panel2);text-decoration:none;color:var(--text)}.siteAssistantProductImg{width:62px;height:62px;flex:0 0 62px;border-radius:9px;overflow:hidden;background:var(--panel);display:grid;place-items:center;font-size:8px;color:var(--muted)}.siteAssistantProductImg img{width:100%;height:100%;object-fit:contain}.siteAssistantProductInfo{min-width:0;display:flex;flex-direction:column;gap:3px}.siteAssistantProductInfo strong{font-size:11px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.siteAssistantProductInfo b{font-size:12px}.siteAssistantProductInfo small{font-size:9px;color:var(--muted)}.siteAssistantProductInfo span{display:flex;align-items:center;gap:3px;color:var(--text);font-size:9px;font-weight:800;margin-top:auto}.siteAssistantAction{display:inline-flex;align-items:center;gap:5px;color:var(--text);font-size:10px;font-weight:800;text-decoration:none;padding:3px 0}.siteAssistantQuick{display:flex;gap:6px;overflow:auto;padding:0 12px 10px}.siteAssistantQuick button{white-space:nowrap;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:7px 9px;font-size:10px;cursor:pointer}.siteAssistantInput{display:flex;gap:7px;padding:10px;border-top:1px solid var(--line)}.siteAssistantInput input{flex:1;min-width:0;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:11px;padding:10px 11px;outline:none;font-size:12px}.siteAssistantInput button{width:39px;border:0;border-radius:10px;background:var(--text);color:var(--bg);display:grid;place-items:center;cursor:pointer}.siteAssistantInput button:disabled{opacity:.45;cursor:not-allowed}@media(max-width:760px){.siteAssistantFab{right:16px;bottom:86px;width:56px;height:56px}.siteAssistantPanel{right:10px;bottom:80px;width:calc(100vw - 20px);height:min(620px,calc(100vh - 100px))}}@media(max-width:420px){.siteAssistantPanel{height:min(560px,calc(100vh - 92px))}}
  `}</style>
 </>
}