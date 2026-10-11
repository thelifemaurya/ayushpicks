"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { EmptyState, ProductGrid } from "@/components/ui";
export function SavedView() {
  const { saved, products } = useStore(); const items = products.filter((p) => saved.includes(p.id));
  return (<div className="wrap py-10"><h1 className="text-3xl font-semibold tracking-tight">Your saved products</h1>
    <h2 className="sr-only">Saved items</h2>
    <div className="mt-6">{items.length ? <ProductGrid items={items} /> : <EmptyState title="Nothing saved yet." text="Save products you want to revisit or compare later." action={<Link href="/search" className="btn-primary">Explore Products</Link>} />}</div></div>);
}
