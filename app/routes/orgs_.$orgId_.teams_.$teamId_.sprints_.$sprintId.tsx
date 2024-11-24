import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { object } from "valibot";
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
import { promiseOwnProperties } from "~/util/ponyfills";
import { coerceNumber } from "~/util/valibot";

const getSprintData = createServerFn({ method: "GET" })
  .middleware([ensureAuthenticatedMw, queryClientMw])
  .validator(
    object({
      orgId: coerceNumber("Invalid orgId"),
      teamId: coerceNumber("Invalid teamId"),
      sprintId: coerceNumber("Invalid sprintId"),
    }),
  )
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
  component: RouteComponent,
  loader: ({ params: { orgId, teamId, sprintId } }) =>
    getSprintData({ data: { orgId, teamId, sprintId } }),
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
  const { orgId, teamId, sprintId } = Route.useParams({
    select: ({ orgId, teamId, sprintId }) => ({
      orgId: Number(orgId),
      teamId: Number(teamId),
      sprintId: Number(sprintId),
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
            id: "org",
            //href: `/orgs/${org.id}`,
          },
          {
            label: team.name,
            id: "team",
            //href: `/orgs/${org.id}/teams/${team.id}`,
          },
          {
            label: sprint.name,
            id: "sprint",
            //href: `/orgs/${org.id}/teams/${team.id}/sprints/${sprint.id}`,
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
