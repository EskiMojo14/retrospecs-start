import { skipToken } from "@tanstack/react-query";
import { toastQueue } from "~/components/toast";
import type { Enums, Tables, TablesInsert } from "~/db/supabase";
import type { PostgrestErrorWithMeta } from "~/util/supabase-query";
import {
  supabaseFn,
  supabaseQueryOptions,
  supabaseMutationOptions,
} from "~/util/supabase-query";

export type UserConfig = Tables<"user_config">;
export type Theme = Enums<"theme">;
export type Groove = Enums<"groove">;

export const getUserConfig = supabaseQueryOptions(
  ({ supabase }, userId: string | undefined) => ({
    queryKey: ["userConfig", userId],
    queryFn: userId
      ? supabaseFn(
          () => supabase.from("user_config").select().eq("user_id", userId),
          (response) => response[0] ?? null,
        )
      : skipToken,
    onError(err: PostgrestErrorWithMeta) {
      toastQueue.add({
        type: "error",
        title: "Failed to retrieve user preferences",
        description: err.message,
      });
    },
  }),
);

export const updateUserConfig = supabaseMutationOptions(
  ({ supabase, queryClient }) => ({
    mutationFn: supabaseFn((update: TablesInsert<"user_config">) =>
      supabase
        .from("user_config")
        .upsert(update)
        .eq("user_id", update.user_id)
        .single(),
    ),
    onMutate({ user_id, groove, theme }: TablesInsert<"user_config">) {
      const { queryKey } = getUserConfig({ supabase, queryClient }, user_id);

      const prevConfig = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (prevConfig) => {
        const res: UserConfig = {
          user_id,
          created_at: new Date().toISOString(),
          theme: null,
          groove: null,
          ...prevConfig,
        };
        if (theme) res.theme = theme;
        if (groove) res.groove = groove;
        return res;
      });
      if (typeof document === "undefined") return { prevConfig };
      if (theme) document.documentElement.dataset.theme = theme;
      if (groove) document.documentElement.dataset.groove = groove;

      return { prevConfig };
    },
    onError(err, { user_id }, context) {
      toastQueue.add({
        type: "error",
        title: "Failed to sync preferences",
        description: err.message,
      });
      if (context?.prevConfig) {
        queryClient.setQueryData(
          getUserConfig({ supabase, queryClient }, user_id).queryKey,
          context.prevConfig,
        );
      }
    },
  }),
);
