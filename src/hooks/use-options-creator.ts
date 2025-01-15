import type { AppContext } from "~/util/supabase-query";
import { useAppContext } from "./use-app-context";

export function useOptionsCreator<Args extends Array<any>, T>(
  getOptions: (context: AppContext, ...args: Args) => T,
  ...args: Args
) {
  return getOptions(useAppContext(), ...args);
}
