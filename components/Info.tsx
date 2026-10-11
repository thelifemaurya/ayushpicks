export function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="wrap max-w-2xl py-12"><h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
    <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_a]:text-accent">{children}</div></div>);
}
