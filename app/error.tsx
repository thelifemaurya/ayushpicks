"use client";
export default function Err({ reset }: { reset: () => void }) {
  return (<div className="mx-auto max-w-sm px-4 py-24 text-center"><h1 className="text-lg font-medium">Something went wrong</h1>
    <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
    <button onClick={reset} className="btn-primary mt-5">Retry</button></div>);
}
