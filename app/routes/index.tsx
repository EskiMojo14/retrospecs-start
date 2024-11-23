import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { ensureAuthenticatedMw } from "@/middleware/auth";
import { queryClientMw } from "@/middleware/query-client";
import { ExtendedFab } from "~/components/button/fab";
import { Symbol } from "~/components/symbol";
import { useSession } from "~/db/provider";
import { Layout } from "~/features/layout";
import { getOrgs, selectAllOrgs, selectOrgIds } from "~/features/orgs";
import { CreateOrg } from "~/features/orgs/create-org";
import { OrgGrid, prefetchOrgCardData } from "~/features/orgs/org-grid";
import { useOptionsCreator } from "~/hooks/use-options-creator";

const getRouteData = createServerFn({ method: "GET" })
  .middleware([ensureAuthenticatedMw, queryClientMw])
  .handler(async ({ context, context: { queryClient, user } }) => {
    const orgs = await queryClient.ensureQueryData(getOrgs(context, user.id));
    await Promise.all(
      selectAllOrgs(orgs).map((org) => prefetchOrgCardData(org, context)),
    );
    return { orgs };
  });

export const Route = createFileRoute("/")({
  loader: () => getRouteData(),
  head: () => ({
    meta: [
      { title: "RetroSpecs - Organisations" },
      {
        name: "description",
        content: "View your organizations",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { orgs } = Route.useLoaderData();
  const session = useSession();
  const { data: orgIds = [] } = useQuery({
    ...useOptionsCreator(getOrgs, session?.user.id),
    initialData: orgs,
    select: selectOrgIds,
  });

  return (
    <Layout>
      <OrgGrid orgIds={orgIds} />
      <CreateOrg
        trigger={
          <ExtendedFab
            color="green"
            aria-label="Create organisation"
            placement="corner"
          >
            <Symbol slot="leading">add</Symbol>
            Create
          </ExtendedFab>
        }
      />
    </Layout>
  );
}
