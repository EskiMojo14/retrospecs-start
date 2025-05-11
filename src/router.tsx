import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { makeQueryClient } from "~/db/query";
import { ErrorPage } from "~/error-page";
import { routeTree } from "./routeTree.gen";

const createSupabaseClient =
  typeof window === "undefined"
    ? (await import("~/db/server")).createServerClient
    : (await import("~/db/client")).createBrowserClient;

export function createRouter() {
  const supabase = createSupabaseClient();
  const queryClient = makeQueryClient();

  const router = routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { supabase, queryClient },
      defaultErrorComponent: ({ error, info }) => (
        <ErrorPage message={error.message} stack={info?.componentStack} />
      ),
      scrollRestoration: true,
    }),
    queryClient,
  );

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
