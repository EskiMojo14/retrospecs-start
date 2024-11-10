import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { toLowerCaseTyped } from "~/util";
import type { AppContext } from "~/util/supabase-query";
import type { Database, Tables } from "./supabase";

export const makeRealtimeHandler =
  <Table extends keyof Database["public"]["Tables"]>(
    table: Table,
    getHandlers: (context: AppContext) => {
      [K in RealtimePostgresChangesPayload<{}>["eventType"] as Lowercase<K>]?: (
        payload: Extract<
          RealtimePostgresChangesPayload<Tables<Table>>,
          { eventType: K }
        >,
      ) => void;
    },
  ) =>
  (context: AppContext): RealtimeChannel => {
    const { supabase } = context;
    const handlers = getHandlers(context);
    return supabase.channel(table).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: table,
      },
      (payload) => {
        handlers[toLowerCaseTyped(payload.eventType)]?.(payload as never);
      },
    );
  };
