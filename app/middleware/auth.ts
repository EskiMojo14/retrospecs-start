import { createMiddleware } from "@tanstack/start";
import { ensureAuthenticated } from "~/db/auth";
import { supabaseMw } from "./supabase";

export const ensureAuthenticatedMw = createMiddleware()
  .middleware([supabaseMw])
  .server(async ({ next, context }) =>
    next({
      context: {
        user: await ensureAuthenticated(context),
      },
    }),
  );
