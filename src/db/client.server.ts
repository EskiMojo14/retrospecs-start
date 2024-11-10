import {
  createServerClient as createClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_URL } from "~/env";
import type { Database } from "./supabase";

export const createServerClient = (request: Request) => {
  const headers = new Headers();

  const supabase = createClient<Database>(
    VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            );
          });
        },
      },
    },
  );

  return { supabase, headers };
};
