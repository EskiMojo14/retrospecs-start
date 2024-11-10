import { createEntityAdapter } from "@reduxjs/toolkit";
import { makeRealtimeHandler } from "~/db/realtime";
import type { Tables, TablesInsert, TablesUpdate } from "~/db/supabase";
import { sortByKey } from "~/util";
import {
  supabaseFn,
  supabaseMutationOptions,
  supabaseQueryOptions,
} from "~/util/supabase-query";
import type { PickRequired } from "~/util/types";

export type Sprint = Tables<"sprints">;

const sprintAdapter = createEntityAdapter<Sprint>({
  sortComparer: sortByKey("created_at", { order: "desc" }),
});

export const {
  selectAll: selectAllSprints,
  selectById: selectSprintById,
  selectIds: selectSprintIds,
  selectEntities: selectSprintEntities,
  selectTotal: selectTotalSprints,
} = sprintAdapter.getSelectors();

export const getSprintsForTeam = supabaseQueryOptions(
  ({ supabase }, teamId: number) => ({
    queryKey: ["sprints", teamId],
    queryFn: supabaseFn(
      () => supabase.from("sprints").select().eq("team_id", teamId),
      (sprints) => sprintAdapter.getInitialState(undefined, sprints),
    ),
  }),
);

export const getSprintCountForTeam = supabaseQueryOptions(
  ({ supabase }, teamId: number) => ({
    queryKey: ["sprints", teamId, "count"],
    queryFn: supabaseFn(
      () =>
        supabase
          .from("sprints")
          .select("*", {
            head: true,
            count: "exact",
          })
          .eq("team_id", teamId),
      (_data, { count }) => count ?? 0,
    ),
  }),
);

export const getSprintById = supabaseQueryOptions(
  ({ supabase }, sprintId: Sprint["id"]) => ({
    queryKey: ["sprint", sprintId],
    queryFn: supabaseFn(() =>
      supabase.from("sprints").select().eq("id", sprintId).single(),
    ),
  }),
);

export const addSprint = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((sprint: TablesInsert<"sprints">) =>
      supabase.from("sprints").insert(sprint),
    ),
    async onSuccess(_: null, { team_id }: TablesInsert<"sprints">) {
      await queryClient.invalidateQueries({
        queryKey: ["sprints", team_id],
      });
    },
  }),
);

export const updateSprint = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn(
      ({ id, ...sprint }: PickRequired<TablesUpdate<"sprints">, "id">) =>
        supabase.from("sprints").update(sprint).eq("id", id),
    ),
    async onSuccess(
      _: null,
      { id, team_id }: PickRequired<TablesUpdate<"sprints">, "id">,
    ) {
      await Promise.all([
        team_id &&
          queryClient.invalidateQueries({
            queryKey: ["sprints", team_id],
          }),
        queryClient.invalidateQueries({
          queryKey: ["sprint", id],
        }),
      ]);
    },
  }),
);

export const deleteSprint = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((id: Sprint["id"]) =>
      supabase.from("sprints").delete().eq("id", id),
    ),
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ["sprints"],
      });
    },
  }),
);

export const sprintRealtime = makeRealtimeHandler("sprints", (context) => {
  const { queryClient } = context;
  return {
    insert(payload) {
      queryClient.setQueryData(
        getSprintsForTeam(context, payload.new.team_id).queryKey,
        (data = sprintAdapter.getInitialState()) =>
          sprintAdapter.addOne(data, payload.new),
      );
    },
    update(payload) {
      queryClient.setQueryData(
        getSprintsForTeam(context, payload.new.team_id).queryKey,
        (data = sprintAdapter.getInitialState()) =>
          sprintAdapter.updateOne(data, {
            id: payload.new.id,
            changes: payload.new,
          }),
      );
      queryClient.setQueryData(
        getSprintById(context, payload.new.id).queryKey,
        payload.new,
      );
    },
    delete(payload) {
      const teamId = payload.old.team_id;
      const sprintId = payload.old.id;
      if (typeof teamId === "undefined" || typeof sprintId === "undefined")
        return;
      queryClient.setQueryData(
        getSprintsForTeam(context, teamId).queryKey,
        (data = sprintAdapter.getInitialState()) =>
          sprintAdapter.removeOne(data, sprintId),
      );
    },
  };
});
