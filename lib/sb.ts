import { createClient } from "@supabase/supabase-js";
import { SB_KEY, SB_URL } from "./site";
// One shared browser client for the admin screens (two clients would fight over the same login storage).
export const sb = createClient(SB_URL || "https://placeholder.supabase.co", SB_KEY || "placeholder");
