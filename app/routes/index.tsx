import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExtendedFab } from "~/components/button/fab";
import { Symbol } from "~/components/symbol";
import { ensureAuthenticated } from "~/db/auth";
import { useSession } from "~/db/provider";
import { Layout } from "~/features/layout";
import { getOrgs, selectAllOrgs, selectOrgIds } from "~/features/orgs";
import { CreateOrg } from "~/features/orgs/create-org";
import { OrgGrid, prefetchOrgCardData } from "~/features/orgs/org-grid";
import { useOptionsCreator } from "~/hooks/use-options-creator";

export const Route = createFileRoute("/")({
  loader: async ({ context, context: { queryClient } }) => {
    const user = await ensureAuthenticated(context);
    const orgs = await queryClient.ensureQueryData(getOrgs(context, user.id));
    await Promise.all(
      selectAllOrgs(orgs).map((org) => prefetchOrgCardData(org, context)),
    );
    return { orgs };
  },
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
