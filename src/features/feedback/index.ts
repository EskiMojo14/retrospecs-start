import type { EntityState } from "@reduxjs/toolkit";
import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { makeRealtimeHandler } from "~/db/realtime";
import type { Enums, Tables, TablesInsert, TablesUpdate } from "~/db/supabase";
import { sortByKey } from "~/util";
import { objectGroupBy } from "~/util/ponyfills";
import type { AppContext } from "~/util/supabase-query";
import {
  compoundKey,
  supabaseFn,
  supabaseMutationOptions,
  supabaseQueryOptions,
} from "~/util/supabase-query";
import type { PickRequired } from "~/util/types";

export type Category = Enums<"category">;
export type Feedback = Tables<"feedback">;
export type ReactionEntry = Tables<"reactions">;
export type Reaction = Enums<"reaction">;

const feedbackAdapter = createEntityAdapter<Feedback>({
  sortComparer: sortByKey("created_at"),
});

export const {
  selectAll: selectAllFeedback,
  selectById: selectFeedbackById,
  selectIds: selectFeedbackIds,
  selectEntities: selectFeedbackEntities,
  selectTotal: selectTotalFeedback,
} = feedbackAdapter.getSelectors();

export const selectFeedbackByCategories = createSelector(
  selectAllFeedback,
  (feedback) => objectGroupBy(feedback, (f) => f.category),
);

export const selectFeedbackByCategory = (
  state: EntityState<Feedback, Feedback["id"]>,
  category: Enums<"category">,
) => selectFeedbackByCategories(state)[category];

const selectReactionId = compoundKey<ReactionEntry>()(
  "feedback_id",
  "user_id",
  "reaction",
);

const reactionAdapter = createEntityAdapter<ReactionEntry, string>({
  selectId: selectReactionId,
  sortComparer: sortByKey("created_at"),
});

export const {
  selectAll: selectAllReactions,
  selectById: selectReactionById,
  selectIds: selectReactionIds,
  selectEntities: selectReactionEntities,
  selectTotal: selectTotalReactions,
} = reactionAdapter.getSelectors();

export const selectReactionsByTypes = createSelector(
  selectAllReactions,
  (reactions) => objectGroupBy(reactions, (r) => r.reaction),
);

export const selectReactionsByType = (
  state: EntityState<ReactionEntry, string>,
  reaction: Enums<"reaction">,
) => selectReactionsByTypes(state)[reaction];

export const getFeedbackBySprint = supabaseQueryOptions(
  ({ supabase }, sprintId: number) => ({
    queryKey: ["feedback", sprintId],
    queryFn: supabaseFn(
      () => supabase.from("feedback").select().eq("sprint_id", sprintId),
      (feedback) => feedbackAdapter.getInitialState(undefined, feedback),
    ),
  }),
);

export const addFeedback = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((feedback: TablesInsert<"feedback">) =>
      supabase.from("feedback").insert(feedback),
    ),
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ["feedback"],
      });
    },
  }),
);

export const updateFeedback = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn(
      ({ id, ...feedback }: PickRequired<TablesUpdate<"feedback">, "id">) =>
        supabase.from("feedback").update(feedback).eq("id", id),
    ),
    async onSuccess(
      _: null,
      { id }: PickRequired<TablesUpdate<"feedback">, "id">,
    ) {
      await queryClient.invalidateQueries({
        queryKey: ["feedback", id],
      });
    },
  }),
);

export const deleteFeedback = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((id: Feedback["id"]) =>
      supabase.from("feedback").delete().eq("id", id),
    ),
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ["feedback"],
      });
    },
  }),
);

export const getReactionsByFeedback = supabaseQueryOptions(
  ({ supabase }, feedbackId: Feedback["id"]) => ({
    queryKey: ["reactions", feedbackId],
    queryFn: supabaseFn(
      () => supabase.from("reactions").select().eq("feedback_id", feedbackId),
      (reactions) => reactionAdapter.getInitialState(undefined, reactions),
    ),
  }),
);

export const toggleReaction = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn(
      ({ reaction, feedback_id, user_id }: TablesInsert<"reactions">) =>
        supabase.rpc("toggle_reaction", {
          react: reaction,
          u_id: user_id,
          f_id: feedback_id,
        }),
      () => null,
    ),
    async onSuccess(_: null, { feedback_id }: TablesInsert<"reactions">) {
      await queryClient.invalidateQueries({
        queryKey: ["reactions", feedback_id],
      });
    },
  }),
);

export const addReaction = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((reaction: TablesInsert<"reactions">) =>
      supabase.from("reactions").insert(reaction),
    ),
    async onSuccess(_: null, { feedback_id }: TablesInsert<"reactions">) {
      await queryClient.invalidateQueries({
        queryKey: ["reactions", feedback_id],
      });
    },
  }),
);

export const deleteReaction = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn(
      ({
        feedback_id,
        user_id,
        reaction,
      }: Parameters<typeof selectReactionId>[0]) =>
        supabase
          .from("reactions")
          .delete()
          .eq("feedback_id", feedback_id)
          .eq("user_id", user_id)
          .eq("reaction", reaction),
    ),
    async onSuccess(
      _: null,
      { feedback_id }: Parameters<typeof selectReactionId>[0],
    ) {
      await queryClient.invalidateQueries({
        queryKey: ["reactions", feedback_id],
      });
    },
  }),
);

const _feedbackRealtime = makeRealtimeHandler("feedback", (context) => {
  const { queryClient } = context;
  return {
    insert(payload) {
      queryClient.setQueryData(
        getFeedbackBySprint(context, payload.new.sprint_id).queryKey,
        (draft = feedbackAdapter.getInitialState()) =>
          feedbackAdapter.addOne(draft, payload.new),
      );
    },
    update(payload) {
      queryClient.setQueryData(
        getFeedbackBySprint(context, payload.new.sprint_id).queryKey,
        (draft = feedbackAdapter.getInitialState()) =>
          feedbackAdapter.updateOne(draft, {
            id: payload.old.id ?? payload.new.id,
            changes: payload.new,
          }),
      );
    },
    delete(payload) {
      const sprintId = payload.old.sprint_id;
      const feedbackId = payload.old.id;
      if (typeof sprintId === "undefined" || typeof feedbackId === "undefined")
        return;
      queryClient.setQueryData(
        getFeedbackBySprint(context, sprintId).queryKey,
        (draft = feedbackAdapter.getInitialState()) =>
          feedbackAdapter.removeOne(draft, feedbackId),
      );
    },
  };
});

const reactionRealtime = makeRealtimeHandler("reactions", (context) => {
  const { queryClient } = context;
  return {
    insert(payload) {
      queryClient.setQueryData(
        getReactionsByFeedback(context, payload.new.feedback_id).queryKey,
        (draft = reactionAdapter.getInitialState()) =>
          reactionAdapter.addOne(draft, payload.new),
      );
    },
    update(payload) {
      queryClient.setQueryData(
        getReactionsByFeedback(context, payload.new.feedback_id).queryKey,
        (draft = reactionAdapter.getInitialState()) =>
          reactionAdapter.updateOne(draft, {
            id: selectReactionId(payload.new),
            changes: payload.new,
          }),
      );
    },
    delete(payload) {
      const { user_id, feedback_id, reaction } = payload.old;
      if (
        typeof reaction === "undefined" ||
        typeof user_id === "undefined" ||
        typeof feedback_id === "undefined"
      )
        return;
      queryClient.setQueryData(
        getReactionsByFeedback(context, feedback_id).queryKey,
        (draft = reactionAdapter.getInitialState()) =>
          reactionAdapter.removeOne(
            draft,
            selectReactionId({ user_id, feedback_id, reaction }),
          ),
      );
    },
  };
});

export const feedbackRealtime = (context: AppContext) => {
  const feedbackChannel = _feedbackRealtime(context);
  const reactionChannel = reactionRealtime(context);
  return {
    unsubscribe() {
      void feedbackChannel.unsubscribe();
      void reactionChannel.unsubscribe();
    },
  };
};
