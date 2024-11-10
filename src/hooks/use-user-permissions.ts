import { useQuery } from "@tanstack/react-query";
import { useSession } from "~/db/provider";
import type { Org } from "~/features/orgs";
import {
  getOrg,
  getOrgMember,
  getOrgMembers,
  getOrgs,
  selectOrgById,
  selectOrgMemberById,
} from "~/features/orgs";
import { getPermission } from "~/util/permissions";
import { useOptionsCreator } from "./use-options-creator";

export function useUserPermissions(orgId: number, userId: string) {
  const { data: org } = useQuery(useOptionsCreator(getOrg, orgId));
  const { data: member } = useQuery({
    ...useOptionsCreator(getOrgMembers, orgId),
    select: (members) => selectOrgMemberById(members, userId),
  });
  return getPermission(org, member);
}

function buildUseCurrentUserPermissions(
  useGetOrg: (orgId: number) => {
    data?: Org;
  },
) {
  return function useCurrentUserPermissions(orgId: number) {
    const session = useSession();
    const { data: org } = useGetOrg(orgId);
    const { data: member } = useQuery(
      useOptionsCreator(getOrgMember, orgId, session?.user.id),
    );
    return getPermission(org, member);
  };
}

export const useCurrentUserPermissions = buildUseCurrentUserPermissions(
  function useGetOrg(orgId: number) {
    return useQuery(useOptionsCreator(getOrg, orgId));
  },
);

export const useCurrentUserPermissionsGetOrgs = buildUseCurrentUserPermissions(
  function useGetOrg(orgId: number) {
    const session = useSession();
    return useQuery({
      ...useOptionsCreator(getOrgs, session?.user.id),
      select: (orgs) => selectOrgById(orgs, orgId),
    });
  },
);
