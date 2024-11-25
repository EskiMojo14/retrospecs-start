import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { object } from "valibot";
import { ensureAuthenticatedMw } from "@/middleware/auth";
import { queryClientMw } from "@/middleware/query-client";
import { ExtendedFab } from "~/components/button/fab";
import { LinkIconButton } from "~/components/icon-button";
import { Symbol } from "~/components/symbol";
import { ensureCurrentUserPermissions } from "~/db/auth";
import { Layout } from "~/features/layout";
import { getOrg } from "~/features/orgs";
import { getSprintsForTeam, selectSprintIds } from "~/features/sprints";
import { CreateSprint } from "~/features/sprints/create-sprint";
import { SprintList } from "~/features/sprints/sprint-list";
import { getTeam } from "~/features/teams";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { useCurrentUserPermissions } from "~/hooks/use-user-permissions";
import { Permission } from "~/util/permissions";
import { promiseOwnProperties } from "~/util/ponyfills";
import { coerceNumber } from "~/util/valibot";

const getTeamData = createServerFn({ method: "GET" })
  .middleware([ensureAuthenticatedMw, queryClientMw])
  .validator(
    object({
      orgId: coerceNumber("Invalid orgId"),
      teamId: coerceNumber("Invalid teamId"),
    }),
  )
  .handler(
    async ({ context, context: { queryClient }, data: { orgId, teamId } }) => {
      const { org, team, sprints } = await promiseOwnProperties({
        org: queryClient.ensureQueryData(getOrg(context, orgId)),
        team: queryClient.ensureQueryData(getTeam(context, teamId)),
        sprints: queryClient.ensureQueryData(
          getSprintsForTeam(context, teamId),
        ),
        permissions: ensureCurrentUserPermissions(context, orgId),
      });

      return {
        org,
        team,
        sprints,
      };
    },
  );

export const Route = createFileRoute("/orgs_/$orgId_/teams_/$teamId")({
  component: RouteComponent,
  loader: ({ params: { orgId, teamId } }) =>
    getTeamData({ data: { orgId, teamId } }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `RetroSpecs - ${loaderData?.team.name}` },
      {
        name: "description",
        content: "View and manage your team's sprints",
      },
    ],
  }),
});

function RouteComponent() {
  const { orgId, teamId } = Route.useParams({
    select: ({ orgId, teamId }) => ({
      orgId: Number(orgId),
      teamId: Number(teamId),
    }),
  });
  const loaderData = Route.useLoaderData();
  const { data: org } = useQuery({
    ...useOptionsCreator(getOrg, orgId),
    initialData: loaderData.org,
  });
  const { data: team } = useQuery({
    ...useOptionsCreator(getTeam, teamId),
    initialData: loaderData.team,
  });
  const { data: sprintIds } = useQuery({
    ...useOptionsCreator(getSprintsForTeam, teamId),
    initialData: loaderData.sprints,
    select: selectSprintIds,
  });
  const permission = useCurrentUserPermissions(orgId);

  return (
    <Layout
      breadcrumbs={[
        {
          label: org.name,
          id: "org",
          to: "/orgs/$orgId",
          params: { orgId: String(orgId) },
        },
        {
          label: team.name,
          id: "team",
          to: "/orgs/$orgId/teams/$teamId",
          params: { orgId: String(orgId), teamId: String(teamId) },
        },
      ]}
      actions={
        <LinkIconButton
          href={`/orgs/${orgId}/teams/${teamId}/members`}
          tooltip="Members"
          slot="action"
        >
          <Symbol>people</Symbol>
        </LinkIconButton>
      }
    >
      <SprintList {...{ sprintIds, teamId, orgId }} />
      {permission >= Permission.Admin && (
        <CreateSprint
          trigger={
            <ExtendedFab
              aria-label="Create sprint"
              color="green"
              placement="corner"
            >
              <Symbol slot="leading">add</Symbol>
              Create
            </ExtendedFab>
          }
          teamId={teamId}
        />
      )}
    </Layout>
  );
}
