import type { Candidate } from "../core";
export type RawItem = Omit<Candidate, "score" | "status" | "reasons" | "trend_signal" | "canonical_url">;
export type Adapter = {
  id: string; label: string;
  // Why it is switched off (missing credentials), or null when ready.
  disabled: () => string | null;
  // Licence note shown in the admin Sources panel.
  licence: string;
  discover: (seeds: { category: string; terms: string[] }[]) => Promise<RawItem[]>;
  // Re-read one item from the source for monitoring. null = source no longer lists it / unavailable.
  lookup: (sourceId: string) => Promise<{ price: number | null; mrp: number | null; inStock: boolean } | null>;
};
