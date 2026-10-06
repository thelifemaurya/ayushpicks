import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_EMAIL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/config'

export const runtime = 'nodejs'

function clean(value: unknown, max = 4000) { return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max) }
function decodeHtml(value: string) { return value.replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>') }
function absoluteUrl(value: string, base: string) { try { return new URL(value, base).toString() } catch { return '' } }
function meta(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i')
  const m = html.match(re); return clean(decodeHtml(m?.[1] || m?.[2] || ''))
}
function firstMatch(html: string, patterns: RegExp[]) { for (const p of patterns) { const m = html.match(p); if (m?.[1]) return clean(decodeHtml(m[1])) } return '' }
function extractProductJsonLd(html: string) {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const s of scripts) { try { const p = JSON.parse(s[1]); const c = Array.isArray(p) ? p : [p, ...(Array.isArray(p?.['@graph']) ? p['@graph'] : [])]; const x = c.find((v:any)=>v?.['@type']==='Product'||(Array.isArray(v?.['@type'])&&v['@type'].includes('Product'))); if(x) return x } catch {} }
  return null
}
function extractAsin(...values: string[]) { for (const v of values) { const m=v.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/product\/|[?&](?:asin|ASIN)=)([A-Z0-9]{10})(?:[/?&]|$)/i); if(m?.[1]) return m[1].toUpperCase() } return '' }
function isAmazonHost(host: string) { const h=host.toLowerCase().split(':')[0]; return ['amazon.in','www.amazon.in','amzn.in','www.amzn.in','amzn.to','www.amzn.to'].includes(h) }
async function fetchPage(url: string) {
  const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36','Accept-Language':'en-IN,en;q=0.9','Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Cache-Control':'no-cache'},redirect:'follow',cache:'no-store'})
  return {response:r,html:(await r.text()).slice(0,4000000)}
}
function normalizeTitle(v:string) { return clean(v,700).replace(/\s*[:|\-]\s*Amazon\.in.*$/i,'').replace(/\s*\|\s*Amazon.*$/i,'').trim() }
function findPrice(html:string, product:any) {
  const offers=product?.offers; const offer=Array.isArray(offers)?offers.find((x:any)=>x?.price)||offers[0]:offers; const jp=clean(offer?.price)
  if(jp&&Number(jp.replace(/,/g,''))>0)return jp
  return firstMatch(html,[/"priceAmount"\s*:\s*"?([0-9][0-9,]*(?:\.[0-9]+)?)/i,/"displayPrice"\s*:\s*"?₹?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i,/id=["']priceblock_(?:ourprice|dealprice|saleprice)["'][^>]*>[^₹0-9]*₹?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i,/class=["'][^"']*a-price-whole[^"']*["'][^>]*>\s*([0-9][0-9,]*)/i,/class=["'][^"']*a-offscreen[^"']*["'][^>]*>\s*₹?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i,/(?:Deal Price|Price)[^₹0-9]{0,80}₹?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i])
}
function findOldPrice(html:string, product:any, current:string) {
  const cur=Number(current.replace(/,/g,'')); const vals:string[]=[]; const offer=Array.isArray(product?.offers)?product.offers[0]:product?.offers
  for(const v of [offer?.listPrice,offer?.priceSpecification?.price]) if(v) vals.push(String(v))
  const x=firstMatch(html,[/"listPrice"\s*:\s*"?([0-9][0-9,]*(?:\.[0-9]+)?)/i,/"list_price"\s*:\s*"?([0-9][0-9,]*(?:\.[0-9]+)?)/i,/"mrp"\s*:\s*"?([0-9][0-9,]*(?:\.[0-9]+)?)/i,/"strikePrice"\s*:\s*"?([0-9][0-9,]*(?:\.[0-9]+)?)/i,/"wasPrice"\s*:\s*"?([0-9][0-9,]*(?:\.[0-9]+)?)/i,/"basisPrice"\s*:\s*"?([0-9][0-9,]*(?:\.[0-9]+)?)/i,/"priceBeforeDiscount"\s*:\s*"?([0-9][0-9,]*(?:\.[0-9]+)?)/i,/(?:M\.R\.P\.|MRP|List Price|Was Price)[^₹0-9]{0,120}₹?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i,/class=["'][^"']*a-text-price[^"']*["'][^>]*>[^₹0-9]*₹?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i]); if(x) vals.push(x)
  const valid=vals.map(v=>Number(v.replace(/,/g,''))).filter(v=>Number.isFinite(v)&&v>0&&(!cur||v>cur)); return valid.length?String(Math.max(...valid)):''
}
async function extractFromPage(sourceUrl:string) {
  let input:URL; try{input=new URL(sourceUrl)}catch{throw new Error('Please paste a valid Amazon India product URL.')}
  if(!['http:','https:'].includes(input.protocol)||!isAmazonHost(input.hostname)) throw new Error('For automatic mode, please use an Amazon India or amzn.in affiliate/product link.')
  let {response,html}=await fetchPage(input.toString()); let finalUrl=response.url||sourceUrl; let asin=extractAsin(sourceUrl,finalUrl)
  if(asin&&(!response.ok||html.length<5000||!extractProductJsonLd(html))){ const fb=await fetchPage(`https://www.amazon.in/dp/${asin}`); if(fb.response.ok&&fb.html.length>html.length){response=fb.response;html=fb.html;finalUrl=fb.response.url||`https://www.amazon.in/dp/${asin}`}}
  if(!response.ok) throw new Error(`Amazon could not be fetched (${response.status}). The affiliate link may be redirecting to a blocked/expired page.`)
  const product=extractProductJsonLd(html); asin=asin||extractAsin(finalUrl,sourceUrl,clean(product?.sku),clean(product?.mpn),clean(product?.productID))
  const name=normalizeTitle(clean(product?.name,700)||firstMatch(html,[/id=["']productTitle["'][^>]*>([\s\S]*?)<\/[^>]+>/i,/id=["']title["'][^>]*>([\s\S]*?)<\/[^>]+>/i,/name=["']title["'][^>]*content=["']([^"']+)["']/i])||meta(html,'og:title')||firstMatch(html,[/<h1[^>]*>([\s\S]*?)<\/h1>/i]))
  const description=clean(product?.description,6000)||meta(html,'og:description')||meta(html,'description'); const imageRaw=typeof product?.image==='string'?product.image:Array.isArray(product?.image)?product.image[0]:meta(html,'og:image'); const image=absoluteUrl(clean(imageRaw),finalUrl); const price=findPrice(html,product); const oldPrice=findOldPrice(html,product,price); const currency=clean((Array.isArray(product?.offers)?product.offers[0]:product?.offers)?.priceCurrency)||'INR'
  const text=decodeHtml(html).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,16000)
  if(!name)throw new Error('Could not identify the Amazon product name. Try the normal product link or Manual mode.')
  return {name,description,image,price,oldPrice,currency,sku:asin||clean(product?.sku)||clean(product?.mpn)||clean(product?.productID),finalUrl,pageText:text}
}

export async function POST(request:NextRequest){try{
  const cookieStore=await cookies(); const supabase=createServerClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll(){return cookieStore.getAll()},setAll(){}}}); const {data:{user}}=await supabase.auth.getUser(); if(!user?.email||user.email.toLowerCase()!==ADMIN_EMAIL.toLowerCase())return NextResponse.json({error:'Unauthorized'},{status:401})
  const apiKey=process.env.GEMINI_API_KEY; if(!apiKey)return NextResponse.json({error:'Gemini API is not configured yet.'},{status:503}); const body=await request.json(); const affiliateUrl=String(body?.affiliateUrl||'').trim(); const productNameInput=String(body?.productName||'').trim(); const sourceInput=String(body?.source||'').trim(); const manual=Boolean(body?.manual)
  if(!affiliateUrl&&(!productNameInput||!sourceInput))return NextResponse.json({error:'Paste an affiliate/product URL, or switch to Manual mode.'},{status:400}); if(affiliateUrl.length>4000)return NextResponse.json({error:'Affiliate URL is too long.'},{status:400})
  let extracted:any=null; if(affiliateUrl&&!manual){try{extracted=await extractFromPage(affiliateUrl)}catch(error:any){return NextResponse.json({error:error?.message||'Could not read this Amazon product page. Try Manual mode.'},{status:422})}}
  const productName=clean(extracted?.name||productNameInput,700); const source=clean([extracted?.description,extracted?.pageText,extracted?.sku?`Product ID/ASIN: ${extracted.sku}`:'',extracted?.price?`Current selling price shown: ₹${extracted.price}`:'',extracted?.oldPrice?`Previous/list price shown: ₹${extracted.oldPrice}`:''].filter(Boolean).join('\n\n'),18000)||sourceInput
  const system=`You are the product-editorial assistant for AYUSHPICKS. Create useful, original product content from supplied product-page data.\n\nSTRICT FACT RULES:\n- Use ONLY facts supported by the supplied product-page data.\n- Never invent specifications, compatibility, materials, battery life, warranty, price, ratings, awards, discounts or features.\n- Never invent a previous price. Only use a previous/list price when explicitly present.\n- Pros and cons must be grounded in supplied facts. Use fewer cons when no limitation is supported.\n- Rewrite retailer wording; do not copy sentences verbatim.\n- Do not mention AI, scraping, Amazon, retailer copy, or these instructions.\n- Keep writing concise, natural and trustworthy.\n\nReturn ONLY valid JSON with exactly these keys:\nshort_description:string\nwhy_picked:string\npros:string[]\ncons:string[]\ntags:string[]\nNo markdown.`
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:`Product name: ${productName}\n\nProduct-page data:\n${source}`}] }],generationConfig:{temperature:0.2,responseMimeType:'application/json'}})}); const data=await response.json(); if(!response.ok){console.error('Gemini API error',response.status,data);return NextResponse.json({error:'Gemini AI request failed. Check your Gemini API key/free-tier access.'},{status:502})}
  const text=data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||'').join('').trim(); if(!text)return NextResponse.json({error:'Gemini returned no content. Please try again.'},{status:502}); let result:any; try{result=JSON.parse(text)}catch{return NextResponse.json({error:'Gemini returned invalid data. Please try again.'},{status:502})}
  const current=extracted?.price?Number(extracted.price.replace(/,/g,'')):null; const old=extracted?.oldPrice?Number(extracted.oldPrice.replace(/,/g,'')):null; const discountPercent=current&&old&&old>current?Math.round(((old-current)/old)*100):null
  return NextResponse.json({product_name:productName,source_url:extracted?.finalUrl||affiliateUrl||null,affiliate_url:affiliateUrl||null,image_url:extracted?.image||null,price:current,old_price:old,discount_percent:discountPercent,currency:extracted?.currency||'INR',asin:extracted?.sku||null,short_description:String(result.short_description||'').trim(),why_picked:String(result.why_picked||'').trim(),pros:Array.isArray(result.pros)?result.pros.map((x:unknown)=>String(x).trim()).filter(Boolean).slice(0,5):[],cons:Array.isArray(result.cons)?result.cons.map((x:unknown)=>String(x).trim()).filter(Boolean).slice(0,3):[],tags:Array.isArray(result.tags)?result.tags.map((x:unknown)=>String(x).trim()).filter(Boolean).slice(0,8):[]})
}catch(error){console.error('AI product generation error',error);return NextResponse.json({error:'AI generation failed. Please try again.'},{status:500})}}
