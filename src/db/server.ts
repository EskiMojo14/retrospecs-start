import { createServerClient as createClient } from "@supabase/ssr";
import { parseCookies, setCookie } from "vinxi/http";
import { VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_URL } from "~/env";
import type { Database } from "./supabase";

export const createServerClient = () => {
  return createClient<Database>(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return Object.entries(parseCookies()).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(name, value, options);
        });
      },
    },
  });
};
