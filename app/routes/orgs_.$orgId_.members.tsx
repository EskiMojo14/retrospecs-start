import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { ensureAuthenticatedMw } from "@/middleware/auth";
import { queryClientMw } from "@/middleware/query-client";
import { ExtendedFab } from "~/components/button/fab";
import { Grid } from "~/components/grid";
import { Symbol } from "~/components/symbol";
import { ensureCurrentUserPermissions, ensureUserPermissions } from "~/db/auth";
import { ensureHydrated, withDehydratedState } from "~/db/query";
import { getInvitesByOrgId } from "~/features/invites";
import { CreateInvite } from "~/features/invites/create-invite";
import { PendingInvites } from "~/features/invites/pending";
import { Layout } from "~/features/layout";
import { getOrg, getOrgMembers, selectOrgMemberIds } from "~/features/orgs";
import { MemberList } from "~/features/teams/member-list";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { useCurrentUserPermissions } from "~/hooks/use-user-permissions";
import { parseNumberParams } from "~/util";
import { Permission } from "~/util/permissions";
import { promiseOwnProperties } from "~/util/ponyfills";
import { numberParamsSchema } from "~/util/valibot";

const getMembersData = createServerFn({ method: "GET" })
  .middleware([ensureAuthenticatedMw, queryClientMw])
  .validator(numberParamsSchema("orgId"))
  .handler(async ({ context, context: { queryClient }, data: { orgId } }) => {
    const orgMembers = await queryClient.ensureQueryData(
      getOrgMembers(context, orgId),
    );

    const currentUserPermissions = await ensureCurrentUserPermissions(
      context,
      orgId,
    );

    return withDehydratedState(
      promiseOwnProperties({
        org: queryClient.ensureQueryData(getOrg(context, orgId)),
        orgMembers,
        currentUserPermissions,
        memberPermissions: Promise.all(
          selectOrgMemberIds(orgMembers).map((memberId) =>
            ensureUserPermissions(context, orgId, memberId),
          ),
        ),
        invites:
          currentUserPermissions >= Permission.Admin
            ? queryClient.ensureQueryData(getInvitesByOrgId(context, orgId))
            : undefined,
      }),
      queryClient,
    );
  });

export const Route = createFileRoute("/orgs_/$orgId_/members")({
  component: RouteComponent,
  params: parseNumberParams("orgId"),
  loader: ({ params, context }) =>
    ensureHydrated(getMembersData({ data: params }), context),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Retrospecs - ${loaderData?.org.name ?? "Org"} Members`,
      },
    ],
  }),
});

function RouteComponent() {
  const { orgId } = Route.useParams();
  const { org, ...loaderData } = Route.useLoaderData();
  const { data: memberIds } = useQuery({
    ...useOptionsCreator(getOrgMembers, orgId),
    initialData: loaderData.orgMembers,
    select: (members) => selectOrgMemberIds(members),
  });
  const permissions = Math.max(
    loaderData.currentUserPermissions,
    useCurrentUserPermissions(orgId),
  ) as Permission;
  return (
    <Layout
      breadcrumbs={[
        {
          label: org.name,
          from: Route.fullPath,
          to: "..",
        },
        {
          label: "Members",
          from: Route.fullPath,
          to: ".",
        },
      ]}
    >
      <Grid>
        <MemberList orgId={orgId} memberIds={memberIds} />
        {permissions >= Permission.Admin && <PendingInvites orgId={orgId} />}
      </Grid>
      {permissions >= Permission.Admin && (
        <CreateInvite
          orgId={orgId}
          trigger={
            <ExtendedFab
              placement="corner"
              color="green"
              aria-label="Invite Member"
            >
              <Symbol slot="leading">group_add</Symbol>
              Invite
            </ExtendedFab>
          }
        />
      )}
    </Layout>
  );
}
