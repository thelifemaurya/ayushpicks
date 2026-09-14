import { Mail } from 'lucide-react'
import { PageShell } from '@/components/site'
export const metadata={title:'Contact'}
export default function Contact(){return <PageShell title="Have a question or correction?" kicker="CONTACT"><section className="copyCard contact"><Mail size={28}/><h2>Talk to AYUSHPICKS</h2><p className="muted">For product corrections, business enquiries, affiliate questions or feedback, email us.</p><a className="btn primary" href="mailto:ayushmourya590@gmail.com">ayushmourya590@gmail.com</a></section></PageShell>}
