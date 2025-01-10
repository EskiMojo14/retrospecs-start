import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import type { AppSupabaseClient } from "~/db";
import { makeQueryClient } from "~/db/query";
import { ErrorPage } from "~/error-page";
import { routeTree } from "./routeTree.gen";

export function createRouterCreator(
  makeSupabaseClient: () => AppSupabaseClient,
) {
  return function createRouter() {
    const supabase = makeSupabaseClient();
    const queryClient = makeQueryClient();

    const router = routerWithQueryClient(
      createTanStackRouter({
        routeTree,
        context: { supabase, queryClient },
        defaultErrorComponent: ({ error, info }) => (
          <ErrorPage message={error.message} stack={info?.componentStack} />
        ),
      }),
      queryClient,
    );

    return router;
  };
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<ReturnType<typeof createRouterCreator>>;
  }
}
