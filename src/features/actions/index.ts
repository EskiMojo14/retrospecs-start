import { createEntityAdapter } from "@reduxjs/toolkit";
import { makeRealtimeHandler } from "~/db/realtime";
import type { Tables, TablesInsert, TablesUpdate } from "~/db/supabase";
import type { Sprint } from "~/features/sprints";
import { sortByKey } from "~/util";
import {
  supabaseFn,
  supabaseMutationOptions,
  supabaseQueryOptions,
} from "~/util/supabase-query";
import type { PickRequired } from "~/util/types";

export type Action = Tables<"actions">;

const actionAdapter = createEntityAdapter<Action>({
  sortComparer: sortByKey("created_at"),
});

export const {
  selectAll: selectAllActions,
  selectById: selectActionById,
  selectIds: selectActionIds,
  selectEntities: selectActionEntities,
  selectTotal: selectTotalActions,
} = actionAdapter.getSelectors();

export const getActionsBySprint = supabaseQueryOptions(
  ({ supabase }, sprintId: Sprint["id"]) => ({
    queryKey: ["actions", sprintId],
    queryFn: supabaseFn(
      () => supabase.from("actions").select().eq("sprint_id", sprintId),
      (actions) => actionAdapter.getInitialState(undefined, actions),
    ),
  }),
);

export const addAction = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((action: TablesInsert<"actions">) =>
      supabase.from("actions").insert(action),
    ),
    async onSuccess(_: null, { sprint_id }: TablesInsert<"actions">) {
      await queryClient.invalidateQueries({
        queryKey: ["actions", sprint_id],
      });
    },
  }),
);

export const updateAction = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn(
      ({ id, ...action }: PickRequired<TablesUpdate<"actions">, "id">) =>
        supabase.from("actions").update(action).eq("id", id),
    ),
    async onSuccess(
      _: null,
      { sprint_id }: PickRequired<TablesUpdate<"actions">, "id">,
    ) {
      await queryClient.invalidateQueries({
        queryKey: ["actions", sprint_id],
      });
    },
  }),
);

export const deleteAction = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((id: Action["id"]) =>
      supabase.from("actions").delete().eq("id", id),
    ),
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ["actions"],
      });
    },
  }),
);

export const actionRealtime = makeRealtimeHandler("actions", (context) => {
  const { queryClient } = context;
  return {
    insert(payload) {
      queryClient.setQueryData(
        getActionsBySprint(context, payload.new.sprint_id).queryKey,
        (draft = actionAdapter.getInitialState()) =>
          actionAdapter.addOne(draft, payload.new),
      );
    },
    delete(payload) {
      const sprintId = payload.old.sprint_id;
      const actionId = payload.old.id;
      if (typeof sprintId === "undefined" || typeof actionId === "undefined")
        return;
      queryClient.setQueryData(
        getActionsBySprint(context, sprintId).queryKey,
        (draft = actionAdapter.getInitialState()) =>
          actionAdapter.removeOne(draft, actionId),
      );
    },
  };
});
