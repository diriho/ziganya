import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseKey = import.meta.env.VITE_API_KEY ?? "";

const isValidUrl = (s: string) => {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

if (!supabaseUrl || !isValidUrl(supabaseUrl)) {
  throw new Error(
    "Missing or invalid VITE_SUPABASE_URL. Set it in Netlify → Site configuration → Environment variables, then trigger a new deploy so the build runs with the variable."
  );
}
if (!supabaseKey || typeof supabaseKey !== "string" || supabaseKey.length < 10) {
  throw new Error(
    "Missing or invalid VITE_API_KEY. Set it in Netlify → Site configuration → Environment variables, then trigger a new deploy."
  );
}

export const dbClient = createClient<Database>(supabaseUrl, supabaseKey);