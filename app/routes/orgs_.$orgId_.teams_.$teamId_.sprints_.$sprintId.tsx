import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { ensureAuthenticatedMw } from "@/middleware/auth";
import { queryClientMw } from "@/middleware/query-client";
import { Divider } from "~/components/divider";
import { Symbol } from "~/components/symbol";
import { Tab, TabList, Tabs } from "~/components/tabs";
import { ensureCurrentUserPermissions } from "~/db/auth";
import { ActionList } from "~/features/actions/actions-list";
import type { Category } from "~/features/feedback";
import { FeedbackList } from "~/features/feedback/feedback-list";
import { Footer } from "~/features/footer";
import { NavBar } from "~/features/nav-bar";
import { getOrg } from "~/features/orgs";
import { getSprintById } from "~/features/sprints";
import { getTeam } from "~/features/teams";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { parseNumberParams } from "~/util";
import { promiseOwnProperties } from "~/util/ponyfills";
import { numberParamsSchema } from "~/util/valibot";

const getSprintData = createServerFn({ method: "GET" })
  .middleware([ensureAuthenticatedMw, queryClientMw])
  .validator(numberParamsSchema("orgId", "teamId", "sprintId"))
  .handler(
    async ({
      context,
      context: { queryClient },
      data: { orgId, teamId, sprintId },
    }) => {
      const { org, team, sprint } = await promiseOwnProperties({
        org: queryClient.ensureQueryData(getOrg(context, orgId)),
        team: queryClient.ensureQueryData(getTeam(context, teamId)),
        sprint: queryClient.ensureQueryData(getSprintById(context, sprintId)),
        permissions: ensureCurrentUserPermissions(context, orgId),
      });
      return { org, team, sprint };
    },
  );

export const Route = createFileRoute(
  "/orgs_/$orgId_/teams_/$teamId_/sprints_/$sprintId",
)({
  params: parseNumberParams("orgId", "teamId", "sprintId"),
  component: RouteComponent,
  loader: ({ params }) => getSprintData({ data: params }),
  head: () => ({
    meta: [
      {
        title: `Retrospecs - Sprint`,
      },
      {
        name: "description",
        content: "View a sprint",
      },
    ],
  }),
});

const categoryDisplay: Record<
  Category | "actions",
  {
    icon: string;
    title: string;
  }
> = {
  good: {
    icon: "reviews",
    title: "Good",
  },
  improvement: {
    icon: "chat_error",
    title: "Poor",
  },
  neutral: {
    icon: "chat_info",
    title: "Neutral",
  },
  actions: {
    icon: "task",
    title: "Actions",
  },
};

const displayEntries = Object.entries(categoryDisplay);

function RouteComponent() {
  const { orgId, teamId, sprintId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { data: org } = useQuery({
    ...useOptionsCreator(getOrg, orgId),
    initialData: loaderData.org,
  });
  const { data: team } = useQuery({
    ...useOptionsCreator(getTeam, teamId),
    initialData: loaderData.team,
  });
  const { data: sprint } = useQuery({
    ...useOptionsCreator(getSprintById, sprintId),
    initialData: loaderData.sprint,
  });
  return (
    <>
      <NavBar
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
            label: sprint.name,
            to: "/orgs/$orgId/teams/$teamId/sprints/$sprintId",
            params: { orgId, teamId, sprintId },
          },
        ]}
      />
      <Tabs>
        <TabList items={displayEntries}>
          {([category, { icon, title }]) => (
            <Tab id={category} icon={<Symbol>{icon}</Symbol>}>
              {title}
            </Tab>
          )}
        </TabList>
      </Tabs>
      <Divider />
      <main
        style={{
          display: "flex",
        }}
      >
        {(["good", "improvement", "neutral"] satisfies Array<Category>).map(
          (category) => (
            <FeedbackList key={category} {...{ category }} />
          ),
        )}
        <ActionList />
      </main>
      <Footer />
    </>
  );
}
