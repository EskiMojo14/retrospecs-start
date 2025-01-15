import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSupabase } from "~/db/provider";
import type { AppContext } from "~/util/supabase-query";

export function useAppContext(): AppContext {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  return useMemo(() => ({ supabase, queryClient }), [supabase, queryClient]);
}
