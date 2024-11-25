import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { object } from "valibot";
import { ensureAuthenticatedMw } from "@/middleware/auth";
import { queryClientMw } from "@/middleware/query-client";
import { Layout } from "~/features/layout";
import { getOrg } from "~/features/orgs";
import { getTeam } from "~/features/teams";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { promiseOwnProperties } from "~/util/ponyfills";
import { coerceNumber } from "~/util/valibot";

const getTeamMemberData = createServerFn({ method: "GET" })
  .middleware([ensureAuthenticatedMw, queryClientMw])
  .validator(
    object({
      orgId: coerceNumber("Invalid orgId"),
      teamId: coerceNumber("Invalid teamId"),
    }),
  )
  .handler(
    async ({ context, context: { queryClient }, data: { orgId, teamId } }) =>
      promiseOwnProperties({
        org: queryClient.ensureQueryData(getOrg(context, orgId)),
        team: queryClient.ensureQueryData(getTeam(context, teamId)),
      }),
  );

export const Route = createFileRoute("/orgs_/$orgId_/teams_/$teamId_/members")({
  component: RouteComponent,
  loader: ({ params: { orgId, teamId } }) =>
    getTeamMemberData({ data: { orgId, teamId } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Retrospecs - ${loaderData?.org.name ?? "Team"} Members`,
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
  return (
    <Layout
      breadcrumbs={[
        {
          label: org.name,
          to: "/orgs/$orgId",
          params: { orgId: String(orgId) },
        },
        {
          label: team.name,
          to: "/orgs/$orgId/teams/$teamId",
          params: { orgId: String(orgId), teamId: String(teamId) },
        },
        {
          label: "Members",
          to: "/orgs/$orgId/teams/$teamId/members",
          params: { orgId: String(orgId), teamId: String(teamId) },
        },
      ]}
    >
      hi
    </Layout>
  );
}
