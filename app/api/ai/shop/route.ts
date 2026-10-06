import { NextRequest, NextResponse } from 'next/server'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ayebyukjekhpdxcdulbg.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_uQsGEl18QM7-QrIrIwnGdA__KyqGZ0_'

type Product={id:string;name:string;slug:string;image_url:string|null;price:number|null;old_price:number|null;currency:string|null;short_description:string|null;why_picked:string|null;pros:string[]|null;cons:string[]|null;rating:number|null;tags:string[]|null;featured:boolean|null}
function clean(v:string){return v.replace(/[(),.\\]/g,' ').replace(/\s+/g,' ').trim().slice(0,80)}
async function catalog(message:string):Promise<Product[]>{
 const q=clean(message), p=new URLSearchParams({select:'id,name,slug,image_url,price,old_price,currency,short_description,why_picked,pros,cons,rating,tags,featured',published:'eq.true',order:'featured.desc,created_at.desc',limit:'30'})
 if(q)p.set('or',`(name.ilike.*${q}*,short_description.ilike.*${q}*,why_picked.ilike.*${q}*)`)
 try{const r=await fetch(`${SUPABASE_URL}/rest/v1/products?${p}`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`},cache:'no-store'});if(r.ok){const x=await r.json();if(Array.isArray(x)&&x.length)return x}}catch(e){console.error(e)}
 try{const r=await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,slug,image_url,price,old_price,currency,short_description,why_picked,pros,cons,rating,tags,featured&published=eq.true&order=featured.desc,created_at.desc&limit=30`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`},cache:'no-store'});if(r.ok)return await r.json()}catch(e){console.error(e)}
 return []
}
export async function POST(req:NextRequest){
 try{
  const rl=rateLimit(clientKey(req,'shop-assistant'),15,10*60*1000)
  if(!rl.allowed)return NextResponse.json({error:'Too many requests. Please try again later.'},{status:429,headers:{'Retry-After':String(Math.ceil((rl.resetAt-Date.now())/1000))}})
  const key=process.env.GEMINI_API_KEY;if(!key)return NextResponse.json({error:'Assistant is not configured yet.'},{status:503})
  const b=await req.json(), message=String(b?.message||'').trim();if(!message)return NextResponse.json({error:'Message is required.'},{status:400});if(message.length>1200)return NextResponse.json({error:'Message is too long.'},{status:400})
  const products=await catalog(message), data=products.map(p=>({id:p.id,name:p.name,slug:p.slug,image_url:p.image_url,price:p.price,old_price:p.old_price,currency:p.currency,short_description:p.short_description,why_picked:p.why_picked,pros:p.pros,cons:p.cons,rating:p.rating,tags:p.tags,featured:p.featured}))
  const system=`You are AYUSHPICKS Shopping Guide. Help users discover products using ONLY this current public catalog. Never invent products, specs, prices, ratings, discounts or URLs. Respect budgets when possible; if no exact match exists, say so. For comparisons, use only catalog products and explain trade-offs. For alternatives, use other catalog products. Be concise and useful. Never claim live stock. You know nothing about internal commissions, affiliate IDs, revenue, ad earnings, admin tools, credentials, API keys or database internals; if asked, say you can only help with the public website and product discovery. Never request secrets.

CATALOG:\n${JSON.stringify(data)}

Return ONLY JSON: {"reply":"...","productIds":["id"],"action":"none|discover|guides"}. productIds max 4 and MUST be catalog IDs. action is discover for /products, guides for /guides, otherwise none.`
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:message}]}],generationConfig:{temperature:.2,maxOutputTokens:600,responseMimeType:'application/json'}})})
  const j=await r.json();if(!r.ok){console.error(j);return NextResponse.json({error:'Assistant request failed. Please try again.'},{status:502})}
  const raw=j?.candidates?.[0]?.content?.parts?.map((x:any)=>x.text||'').join('').trim();if(!raw)return NextResponse.json({error:'No response received.'},{status:502})
  let out:any;try{out=JSON.parse(raw)}catch{out={reply:raw,productIds:[],action:'none'}}
  const ids=new Set(products.map(p=>p.id)), selected=Array.isArray(out.productIds)?out.productIds.filter((id:string)=>ids.has(id)).slice(0,4):[]
  return NextResponse.json({text:String(out.reply||'I could not find a useful match yet.'),products:products.filter(p=>selected.includes(p.id)),action:['discover','guides'].includes(out.action)?out.action:'none'},{headers:{'Cache-Control':'no-store'}})
 }catch(e){console.error(e);return NextResponse.json({error:'Assistant is temporarily unavailable.'},{status:500})}
}
