import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { ensureAuthenticatedMw } from "@/middleware/auth";
import { queryClientMw } from "@/middleware/query-client";
import { ensureHydrated, withDehydratedState } from "~/db/query";
import { Layout } from "~/features/layout";
import { getOrg } from "~/features/orgs";
import { getTeam } from "~/features/teams";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { parseNumberParams } from "~/util";
import { promiseOwnProperties } from "~/util/ponyfills";
import { numberParamsSchema } from "~/util/valibot";

const getTeamMemberData = createServerFn({ method: "GET" })
  .middleware([ensureAuthenticatedMw, queryClientMw])
  .validator(numberParamsSchema("orgId", "teamId"))
  .handler(
    async ({ context, context: { queryClient }, data: { orgId, teamId } }) =>
      withDehydratedState(
        promiseOwnProperties({
          org: queryClient.ensureQueryData(getOrg(context, orgId)),
          team: queryClient.ensureQueryData(getTeam(context, teamId)),
        }),
        queryClient,
      ),
  );

export const Route = createFileRoute("/orgs_/$orgId_/teams_/$teamId_/members")({
  params: parseNumberParams("orgId", "teamId"),
  component: RouteComponent,
  loader: ({ params, context }) =>
    ensureHydrated(getTeamMemberData({ data: params }), context),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Retrospecs - ${loaderData?.org.name ?? "Team"} Members`,
      },
    ],
  }),
});

function RouteComponent() {
  const { orgId, teamId } = Route.useParams();
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
          params: { orgId },
        },
        {
          label: team.name,
          to: "/orgs/$orgId/teams/$teamId",
          params: { orgId, teamId },
        },
        {
          label: "Members",
          to: "/orgs/$orgId/teams/$teamId/members",
          params: { orgId, teamId },
        },
      ]}
    >
      hi
    </Layout>
  );
}
