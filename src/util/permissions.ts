import { createSelector } from "@reduxjs/toolkit";
import type { Org, OrgMember } from "~/features/orgs";

export enum Permission {
  Unauthenticated,
  Member,
  Admin,
  Owner,
}

export const getPermission = createSelector(
  (org: Org | undefined) => org,
  (_: unknown, member: OrgMember | undefined) => member,
  (org: Org | undefined, member: OrgMember | undefined) => {
    if (!org || !member) return Permission.Unauthenticated;
    if (org.owner_id === member.user_id) return Permission.Owner;
    if (member.role === "admin") return Permission.Admin;
    return Permission.Member;
  },
);
