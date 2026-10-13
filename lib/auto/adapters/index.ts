import { flipkart } from "./flipkart"; import { feed } from "./feed"; import type { Adapter } from "./types";
export const ADAPTERS: Adapter[] = [flipkart, feed];
export const adapterById = (id: string) => ADAPTERS.find((a) => a.id === id);
