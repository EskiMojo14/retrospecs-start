import { dehydrate, hydrate, QueryClient } from "@tanstack/react-query";
import type { AppContext } from "~/util/supabase-query";
import type { MaybePromise } from "~/util/types";

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

export const withDehydratedState = async <T extends object>(
  data: MaybePromise<T>,
  queryClient: QueryClient,
) => ({
  ...(await data),
  dehydratedState: dehydrate(queryClient) as {},
});

export const ensureHydrated = async <T extends { dehydratedState: unknown }>(
  data: MaybePromise<T>,
  { queryClient }: Pick<AppContext, "queryClient">,
) => {
  const { dehydratedState, ...rest } = await data;
  hydrate(queryClient, dehydratedState);
  return rest;
};
