import { createMiddleware } from "@tanstack/react-start";
import { createServerClient } from "~/db/server";

export const supabaseMw = createMiddleware().server(({ next }) =>
  next({
    context: {
      supabase: createServerClient(),
    },
  }),
);
