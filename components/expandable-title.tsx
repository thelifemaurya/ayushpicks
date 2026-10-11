'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function ExpandableTitle({ fullTitle, displayTitle }: { fullTitle:string; displayTitle:string }) {
  const [expanded,setExpanded] = useState(false)
  const truncated = fullTitle !== displayTitle
  return <div className={`expandableTitle ${expanded?'expanded':''}`}><h1>{expanded ? fullTitle : displayTitle}</h1>{truncated && <button type="button" onClick={() => setExpanded(v=>!v)}>{expanded ? <>Show less <ChevronUp size={14}/></> : <>Show more <ChevronDown size={14}/></>}</button>}</div>
}
