import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { ensureAuthenticatedMw } from "@/middleware/auth";
import { queryClientMw } from "@/middleware/query-client";
import { ExtendedFab } from "~/components/button/fab";
import { LinkIconButton } from "~/components/icon-button";
import { Symbol } from "~/components/symbol";
import { ensureCurrentUserPermissions } from "~/db/auth";
import { ensureHydrated, withDehydratedState } from "~/db/query";
import { Layout } from "~/features/layout";
import { getOrg } from "~/features/orgs";
import { getTeamsByOrg, selectAllTeams, selectTeamIds } from "~/features/teams";
import { CreateTeam } from "~/features/teams/create-team";
import { prefetchTeamCardData, TeamGrid } from "~/features/teams/team-grid";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { useCurrentUserPermissions } from "~/hooks/use-user-permissions";
import { parseNumberParams } from "~/util";
import { Permission } from "~/util/permissions";
import { promiseOwnProperties } from "~/util/ponyfills";
import { numberParamsSchema } from "~/util/valibot";

const getOrgData = createServerFn({ method: "GET" })
  .middleware([ensureAuthenticatedMw, queryClientMw])
  .validator(numberParamsSchema("orgId"))
  .handler(async ({ context, context: { queryClient }, data: { orgId } }) => {
    const teams = await queryClient.ensureQueryData(
      getTeamsByOrg(context, orgId),
    );
    const { org } = await promiseOwnProperties({
      org: queryClient.ensureQueryData(getOrg(context, orgId)),
      orgPerms: ensureCurrentUserPermissions(context, orgId),
      teamCardData: Promise.all(
        selectAllTeams(teams).map((team) =>
          prefetchTeamCardData(team, context),
        ),
      ),
    });
    return withDehydratedState(
      {
        org,
        teams,
      },
      queryClient,
    );
  });

export const Route = createFileRoute("/orgs_/$orgId")({
  params: parseNumberParams("orgId"),
  component: RouteComponent,
  loader: ({ params, context }) =>
    ensureHydrated(getOrgData({ data: params }), context),
  head: ({ loaderData }) => ({
    meta: [
      { title: `RetroSpecs - ${loaderData?.org.name ?? "Org"}` },
      {
        name: "description",
        content: "View and manage your organization and its teams",
      },
    ],
  }),
});

function RouteComponent() {
  const { orgId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { data: org } = useQuery({
    ...useOptionsCreator(getOrg, orgId),
    initialData: loaderData.org,
  });
  const { data: teamIds = [] } = useQuery({
    ...useOptionsCreator(getTeamsByOrg, orgId),
    initialData: loaderData.teams,
    select: selectTeamIds,
  });
  const permission = useCurrentUserPermissions(orgId);

  return (
    <Layout
      breadcrumbs={[
        {
          label: org.name,
          from: Route.fullPath,
          to: ".",
        },
      ]}
      actions={
        <LinkIconButton
          href={`/orgs/${orgId}/members`}
          tooltip="Members"
          slot="action"
        >
          <Symbol>people</Symbol>
        </LinkIconButton>
      }
    >
      <TeamGrid orgId={orgId} teamIds={teamIds} />
      {permission >= Permission.Admin && (
        <CreateTeam
          trigger={
            <ExtendedFab
              color="green"
              aria-label="Create team"
              placement="corner"
            >
              <Symbol slot="leading">add</Symbol>
              Create
            </ExtendedFab>
          }
          orgId={orgId}
        />
      )}
    </Layout>
  );
}
