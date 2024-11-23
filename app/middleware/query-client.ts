import { createMiddleware } from "@tanstack/start";
import { makeQueryClient } from "~/db/query";

export const queryClientMw = createMiddleware().server(({ next }) =>
  next({
    context: {
      queryClient: makeQueryClient(),
    },
  }),
);
