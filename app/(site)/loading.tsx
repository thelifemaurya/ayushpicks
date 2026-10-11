import { Skeleton } from "@/components/ui";
export default function Loading() { return <div className="wrap grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}</div>; }
