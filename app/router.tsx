import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { createBrowserClient } from "~/db/client";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const supabase = createBrowserClient();

  const router = createTanStackRouter({
    routeTree,
    context: { supabase },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
