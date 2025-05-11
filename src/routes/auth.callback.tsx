import {  isRedirect, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestURL } from "@tanstack/react-start/server";
import { createServerClient } from "~/db/server";

const redirectToErr = (error?: string, error_description?: string) =>
  redirect({
    to: `/sign-in`,
    search: { error, error_description },
  });

const authCallback = createServerFn().handler(async () => {
  const { searchParams } = getRequestURL();
  const error = searchParams.get("error") ?? undefined;
  const errorDescription = searchParams.get("error_description") ?? undefined;
  if (error ?? errorDescription) throw redirectToErr(error, errorDescription);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const supabase = createServerClient();
  if (!code) throw redirectToErr("No code provided");
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw redirectToErr(error.message);
    throw redirect({ to: next });
  } catch (error) {
    if (isRedirect(error)) throw error;

    console.error(error);
    throw redirectToErr(
      "An error occurred",
      error instanceof Error ? error.message : String(error),
    );
  }
});

export const Route = createFileRoute({
  loader: () => authCallback(),
});
