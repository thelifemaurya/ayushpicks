import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getProducts } from "@/lib/products";
import { CATEGORIES, slugify } from "@/lib/data";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const latest = products.map((p) => p.updatedAt).filter((d): d is string => !!d).sort().pop();
  const now = latest ? new Date(latest) : new Date();
  const cats = [...new Set([...CATEGORIES, ...products.map((p) => p.category)])].filter((c) => products.some((p) => p.category === c));
  return [
    { url: SITE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/search`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE}/compare`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ...cats.map((c) => ({ url: `${SITE}/category/${slugify(c)}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${SITE}/product/${p.slug}`, lastModified: p.updatedAt ? new Date(p.updatedAt) : now, changeFrequency: "weekly" as const, priority: 0.9,
      ...(p.images[0] ? { images: [p.images[0]] } : {}) })),
  ];
}
