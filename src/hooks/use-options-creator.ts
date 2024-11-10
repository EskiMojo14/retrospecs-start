import { useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "~/db/provider";
import type { AppContext } from "~/util/supabase-query";

export function useOptionsCreator<Args extends Array<any>, T>(
  getOptions: (context: AppContext, ...args: Args) => T,
  ...args: Args
) {
  const appContext: AppContext = {
    supabase: useSupabase(),
    queryClient: useQueryClient(),
  };
  return getOptions(appContext, ...args);
}
