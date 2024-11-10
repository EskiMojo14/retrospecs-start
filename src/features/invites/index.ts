import { createEntityAdapter } from "@reduxjs/toolkit";
import { skipToken } from "@tanstack/react-query";
import { toastQueue } from "~/components/toast";
import type { Tables, TablesInsert } from "~/db/supabase";
import type { Profile } from "~/features/profiles";
import { sortByKey } from "~/util";
import {
  supabaseFn,
  supabaseMutationOptions,
  supabaseQueryOptions,
} from "~/util/supabase-query";
import type { PickPartial } from "~/util/types";

export type Invite = Tables<"invites">;

export interface InviteWithInviter extends Omit<Invite, "user_id"> {
  org_name: string;
  inviter: Pick<Profile, "avatar_url" | "color" | "display_name"> | null;
  user_id?: never;
}

export const inviteAdapter = createEntityAdapter({
  selectId: (invite: InviteWithInviter) => invite.email,
  sortComparer: sortByKey("created_at"),
});

export const {
  selectAll: selectAllInvites,
  selectById: selectInviteById,
  selectIds: selectInviteIds,
  selectEntities: selectInviteEntities,
  selectTotal: selectTotalInvites,
} = inviteAdapter.getSelectors();

export const getInvitesByUserId = supabaseQueryOptions(
  ({ supabase }, user_id: string | undefined) => ({
    queryKey: ["invites", { user_id }],
    queryFn: user_id
      ? supabaseFn(
          () =>
            supabase
              .from("invites")
              .select(
                `created_at,created_by,email,org_id,
            ...orgs(org_name:name),
            inviter:profiles!invites_created_by_fkey(avatar_url,color,display_name)
            `,
              )
              .eq("user_id", user_id),
          (invites) => inviteAdapter.getInitialState(undefined, invites),
        )
      : skipToken,
  }),
);

export const getInvitesByOrgId = supabaseQueryOptions(
  ({ supabase }, org_id: number) => ({
    queryKey: ["invites", { org_id }],
    queryFn: supabaseFn(
      () =>
        supabase
          .from("invites")
          .select(
            `created_at,created_by,email,org_id,
            ...orgs(org_name:name),
            inviter:profiles!invites_created_by_fkey(avatar_url,color,display_name)
            `,
          )
          .eq("org_id", org_id),
      (invites) => inviteAdapter.getInitialState(undefined, invites),
    ),
  }),
);

export const addInvite = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((invite: TablesInsert<"invites">) =>
      supabase.from("invites").insert(invite),
    ),
    onError(error) {
      toastQueue.add({
        type: "error",
        title: "Failed to send invite",
        description: error.message,
      });
    },
    onSuccess: async (_: null, { org_id, email }: TablesInsert<"invites">) => {
      toastQueue.add(
        {
          type: "success",
          title: `Invite sent to ${email}`,
          description: "The user will see the invite once logged in.",
        },
        {
          timeout: 10000,
        },
      );
      await queryClient.invalidateQueries({
        queryKey: ["invites", { org_id }],
      });
    },
  }),
);

type InviteIds = Pick<
  PickPartial<Invite, "user_id">,
  "email" | "org_id" | "user_id"
>;

export const deleteInvite = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn(({ email, org_id }: InviteIds) =>
      supabase.from("invites").delete().eq("email", email).eq("org_id", org_id),
    ),
    onSuccess: async (_: null, { org_id, user_id }: InviteIds) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["invites", { org_id }],
        }),
        user_id &&
          queryClient.invalidateQueries({
            queryKey: ["invites", { user_id }],
          }),
      ]);
    },
  }),
);

type AcceptIds = Pick<Invite, "org_id" | "user_id">;

export const acceptInvite = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn(
      ({ org_id }: AcceptIds) =>
        supabase.rpc("accept_invite", { o_id: org_id }),
      () => null,
    ),
    onError(error) {
      toastQueue.add({
        type: "error",
        title: "Failed to accept invite",
        description: error.message,
      });
    },
    onSuccess: async (_: null, { org_id, user_id }: AcceptIds) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["invites", { org_id }],
        }),
        ...(user_id
          ? [
              queryClient.invalidateQueries({
                queryKey: ["orgs", { user_id }],
              }),

              queryClient.invalidateQueries({
                queryKey: ["invites", { user_id }],
              }),
            ]
          : []),
      ]);
    },
  }),
);
