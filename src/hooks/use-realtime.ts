import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect } from "react";
import type { AppContext } from "~/util/supabase-query";
import { useAppContext } from "./use-app-context";

export function useRealtime(
  realtimeHandler: (context: AppContext) => RealtimeChannel,
) {
  const context = useAppContext();
  useEffect(() => {
    const channel = realtimeHandler(context);
    return () => {
      void channel.unsubscribe();
    };
  }, [realtimeHandler, context]);
}
