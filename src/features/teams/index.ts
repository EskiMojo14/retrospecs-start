import { createEntityAdapter } from "@reduxjs/toolkit";
import { toastQueue } from "~/components/toast";
import type { Tables, TablesInsert, TablesUpdate } from "~/db/supabase";
import type { Org } from "~/features/orgs";
import type { Profile } from "~/features/profiles";
import { sortByKey, sortByName } from "~/util";
import {
  compoundKey,
  supabaseFn,
  supabaseMutationOptions,
  supabaseQueryOptions,
} from "~/util/supabase-query";
import type { PickRequired } from "~/util/types";

export type Team = Tables<"teams">;

export const teamAdapter = createEntityAdapter<Team>({
  sortComparer: sortByName,
});

export const {
  selectAll: selectAllTeams,
  selectById: selectTeamById,
  selectIds: selectTeamIds,
  selectEntities: selectTeamEntities,
  selectTotal: selectTotalTeams,
} = teamAdapter.getSelectors();

export const getTeam = supabaseQueryOptions(({ supabase }, id: Team["id"]) => ({
  queryKey: ["team", id],
  queryFn: supabaseFn(() =>
    supabase.from("teams").select().eq("id", id).single(),
  ),
}));

export const getTeamsByOrg = supabaseQueryOptions(
  ({ supabase }, orgId: Org["id"]) => ({
    queryKey: ["teams", orgId],
    queryFn: supabaseFn(
      () => supabase.from("teams").select().eq("org_id", orgId),
      (teams) => teamAdapter.getInitialState(undefined, teams),
    ),
  }),
);

export const getTeamCountByOrg = supabaseQueryOptions(
  ({ supabase }, orgId: Org["id"]) => ({
    queryKey: ["teams", orgId, "count"],
    queryFn: supabaseFn(
      () =>
        supabase
          .from("teams")
          .select("*", { count: "exact", head: true })
          .eq("org_id", orgId),
      (_res, { count }) => count ?? 0,
    ),
  }),
);

export const addTeam = supabaseMutationOptions(({ supabase, queryClient }) => ({
  mutationFn: supabaseFn((team: TablesInsert<"teams">) =>
    supabase.from("teams").insert(team),
  ),
  async onSuccess(_: null, { org_id, name }: TablesInsert<"teams">) {
    toastQueue.add(
      {
        type: "success",
        title: "Team added",
        description: `Successfully added team "${name}"`,
      },
      {
        timeout: 5000,
      },
    );
    await queryClient.invalidateQueries({
      queryKey: ["teams", org_id],
    });
  },
  onError(error) {
    toastQueue.add({
      type: "error",
      title: "Failed to add team",
      description: error.message,
    });
  },
}));

export const updateTeam = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn(
      ({ id, ...team }: PickRequired<TablesUpdate<"teams">, "id">) =>
        supabase.from("teams").update(team).eq("id", id),
    ),
    onMutate({ id }: PickRequired<TablesUpdate<"teams">, "id">) {
      const { queryKey } = getTeamsByOrg({ supabase, queryClient }, id);
      const prevTeams = queryClient.getQueryData(queryKey);
      return { prevTeam: prevTeams && selectTeamById(prevTeams, id) };
    },
    async onSuccess(_: null, { org_id, name: newName, id }, { prevTeam }) {
      const name = newName ?? prevTeam?.name;
      toastQueue.add(
        {
          type: "success",
          title: "Team updated",
          description: `Successfully updated team${name ? ` "${name}"` : ""}`,
        },
        {
          timeout: 5000,
        },
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["teams", org_id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["team", id],
        }),
      ]);
    },
    onError(error) {
      toastQueue.add({
        type: "error",
        title: "Failed to update team",
        description: error.message,
      });
    },
  }),
);

export const deleteTeam = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((id: Team["id"]) =>
      supabase.from("teams").delete().eq("id", id),
    ),
    onMutate(id: Team["id"]) {
      const { queryKey } = getTeamsByOrg({ supabase, queryClient }, id);
      const prevTeams = queryClient.getQueryData(queryKey);
      return { prevTeam: prevTeams && selectTeamById(prevTeams, id) };
    },
    async onSuccess(_: null, id, { prevTeam }) {
      toastQueue.add(
        {
          type: "success",
          title: "Team deleted",
          description: `Successfully deleted team${prevTeam ? ` "${prevTeam.name}"` : ""}`,
        },
        {
          timeout: 5000,
        },
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["teams"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["team", id],
        }),
      ]);
    },
    onError(error) {
      toastQueue.add({
        type: "error",
        title: "Failed to delete team",
        description: error.message,
      });
    },
  }),
);

export type TeamMember = Tables<"team_members">;

export interface TeamMemberWithProfile extends TeamMember {
  profile: Profile | null;
}

const selectTeamMemberId = compoundKey<TeamMember>()("team_id", "user_id");

const teamMemberAdapter = createEntityAdapter<TeamMemberWithProfile, string>({
  selectId: selectTeamMemberId,
  sortComparer: sortByKey("created_at"),
});

export const {
  selectAll: selectAllTeamMembers,
  selectById: selectTeamMemberById,
  selectIds: selectTeamMemberIds,
  selectEntities: selectTeamMemberEntities,
  selectTotal: selectTotalTeamMembers,
} = teamMemberAdapter.getSelectors();

export const getTeamMembers = supabaseQueryOptions(
  ({ supabase }, teamId: Team["id"]) => ({
    queryKey: ["teamMembers", teamId],
    queryFn: supabaseFn(
      () =>
        supabase
          .from("team_members")
          .select(`*, profile:profiles(*)`)
          .eq("team_id", teamId),
      (members) => teamMemberAdapter.getInitialState(undefined, members),
    ),
  }),
);

export const getTeamMemberCount = supabaseQueryOptions(
  ({ supabase }, teamId: Team["id"]) => ({
    queryKey: ["teamMembers", teamId, "count"],
    queryFn: supabaseFn(
      () =>
        supabase
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("team_id", teamId),
      (_res, { count }) => count ?? 0,
    ),
  }),
);

export const addTeamMember = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((member: TablesInsert<"team_members">) =>
      supabase.from("team_members").insert(member),
    ),
    async onSuccess(_: null, { team_id }: TablesInsert<"team_members">) {
      await queryClient.invalidateQueries({
        queryKey: ["teamMembers", team_id],
      });
    },
  }),
);

export const updateTeamMember = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn(
      ({
        team_id,
        user_id,
        ...member
      }: PickRequired<TablesUpdate<"team_members">, "team_id" | "user_id">) =>
        supabase
          .from("team_members")
          .update(member)
          .eq("team_id", team_id)
          .eq("user_id", user_id),
    ),
    async onSuccess(
      _: null,
      {
        team_id,
      }: PickRequired<TablesUpdate<"team_members">, "team_id" | "user_id">,
    ) {
      await queryClient.invalidateQueries({
        queryKey: ["teamMembers", team_id],
      });
    },
  }),
);

export const deleteTeamMember = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((member: Pick<TeamMember, "team_id" | "user_id">) =>
      supabase
        .from("team_members")
        .delete()
        .eq("team_id", member.team_id)
        .eq("user_id", member.user_id),
    ),
    async onSuccess(
      _: null,
      { team_id }: Pick<TeamMember, "team_id" | "user_id">,
    ) {
      await queryClient.invalidateQueries({
        queryKey: ["teamMembers", team_id],
      });
    },
  }),
);
