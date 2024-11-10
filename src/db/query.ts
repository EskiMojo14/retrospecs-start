import { QueryClient } from "@tanstack/react-query";

/**
 * @param staleTime Time before data is considered stale. Default is 5 minutes.
 */
export const makeQueryClient = (staleTime = 1000 * 60 * 5) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime,
      },
    },
  });
