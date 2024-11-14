import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { getRequestURL } from "vinxi/http";
import { createServerClient } from "~/db/server";

const authCallback = createServerFn().handler(async () => {
  const url = getRequestURL();
  const error = url.searchParams.get("error") ?? undefined;
  const errorDescription =
    url.searchParams.get("error_description") ?? undefined;
  if (error ?? errorDescription) {
    throw redirect({
      to: `/sign-in`,
      search: { error, error_description: errorDescription },
    });
  }
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const supabase = createServerClient();
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return redirect({
          to: next,
        });
      }
      return redirect({
        to: `/sign-in`,
        search: { error: error.message },
      });
    } catch (error) {
      console.error(error);
      return redirect({
        to: `/sign-in`,
        search: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
  throw redirect({
    to: `/sign-in`,
    search: { error: "No code provided" },
  });
});

export const Route = createFileRoute("/auth/callback")({
  loader: () => authCallback(),
});
