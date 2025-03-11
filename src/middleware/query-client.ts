import { createMiddleware } from "@tanstack/react-start";
import { makeQueryClient } from "~/db/query";

export const queryClientMw = createMiddleware().server(({ next }) =>
  next({
    context: {
      queryClient: makeQueryClient(),
    },
  }),
);
