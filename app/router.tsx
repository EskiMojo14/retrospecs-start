import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { createBrowserClient } from "~/db/client";
import { makeQueryClient } from "~/db/query";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const supabase = createBrowserClient();
  const queryClient = makeQueryClient();

  const router = routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { supabase, queryClient },
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
