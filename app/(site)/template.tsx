// A template re-mounts on every navigation, so each page eases in smoothly.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
