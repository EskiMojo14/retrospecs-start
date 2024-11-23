import { createMiddleware } from "@tanstack/start";
import { createServerClient } from "~/db/server";

export const supabaseMw = createMiddleware().server(({ next }) =>
  next({
    context: {
      supabase: createServerClient(),
    },
  }),
);
