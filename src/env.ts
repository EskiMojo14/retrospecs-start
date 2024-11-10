import { object, parse, string } from "valibot";

const schema = object({
  VITE_SUPABASE_URL: string("VITE_SUPABASE_URL is required"),
  VITE_SUPABASE_ANON_KEY: string("VITE_SUPABASE_ANON_KEY is required"),
});

export const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = parse(
  schema,
  import.meta.env ?? process.env,
);
