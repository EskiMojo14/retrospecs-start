import { useQuery } from "@tanstack/react-query";
import { useSession } from "~/db/provider";
import { getProfile } from "~/features/profiles";
import { useOptionsCreator } from "./use-options-creator";

export function useCurrentProfile() {
  const session = useSession();
  const { data: profile } = useQuery(
    useOptionsCreator(getProfile, session?.user.id),
  );
  return profile;
}
