import { useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { NavigateOptions, ToOptions } from "@tanstack/react-router";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { createServerFn, Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";
import { RouterProvider } from "react-aria-components";
import { lazily } from "react-lazily";
import { ensureAuthenticatedMw } from "@/middleware/auth";
import { queryClientMw } from "@/middleware/query-client";
import { ForeEauFore } from "~/404";
import { BreakpointDisplay } from "~/components/grid";
import { GlobalToastRegion } from "~/components/toast/toast-region";
import { SessionProvider, useSession } from "~/db/provider";
import { ErrorPage } from "~/error-page";
import type { Profile } from "~/features/profiles";
import { getProfile } from "~/features/profiles";
import type { UserConfig } from "~/features/user_config";
import { getUserConfig } from "~/features/user_config";
import { useIsomorphicLayoutEffect } from "~/hooks/use-isomorphic-layout-effect";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { getUrl } from "~/util/isomorphic";
import { promiseOwnProperties } from "~/util/ponyfills";
import type { AppContext } from "~/util/supabase-query";
import type { Nullish } from "~/util/types";
import "~/index.scss";

const { TanStackRouterDevtools } =
  process.env.NODE_ENV === "development"
    ? lazily(() => import("@tanstack/router-devtools"))
    : { TanStackRouterDevtools: () => null };

interface RootLoaderResponse {
  config?: UserConfig | null;
  profile?: Profile;
}

const getUserData = createServerFn({ method: "GET" })
  .middleware([ensureAuthenticatedMw, queryClientMw])
  .handler(
    async ({ context, context: { queryClient, user } }) =>
      promiseOwnProperties({
        profile: queryClient.ensureQueryData(getProfile(context, user.id)),
        config: queryClient.ensureQueryData(getUserConfig(context, user.id)),
      }) satisfies Promise<RootLoaderResponse>,
  );

const noAuthRoutes = new Set(["/sign-in", "/auth/callback"]);

export const Route = createRootRouteWithContext<AppContext>()({
  loader: async (): Promise<RootLoaderResponse> => {
    const url = await getUrl();
    if (noAuthRoutes.has(url.pathname)) {
      return {};
    }
    return getUserData();
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],
    links: [{ rel: "icon", href: "/assets/retrospecs.png" }],
  }),
  component: RootComponent,
  notFoundComponent: () => <ForeEauFore />,
  errorComponent: ({ error, info }) => (
    <ErrorPage
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      message={error.message ?? String(error)}
      stack={info?.componentStack}
    />
  ),
});
declare module "react-aria-components" {
  interface RouterConfig {
    href: ToOptions["to"] | (string & {});
    routerOptions: Omit<NavigateOptions, keyof ToOptions>;
  }
}

function RootComponent() {
  const router = useRouter();
  return (
    <RouterProvider
      navigate={(to, options) => {
        if (to?.startsWith("http")) {
          window.location.href = to;
        } else {
          void router.navigate({ to, ...options });
        }
      }}
      useHref={(to) =>
        to?.startsWith("http") ? to : router.buildLocation({ to }).href
      }
    >
      <SessionProvider>
        <RootDocument>
          <Outlet />
          <GlobalToastRegion aria-label="Notifications" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <TanStackRouterDevtools position="bottom-right" />
          <BreakpointDisplay />
        </RootDocument>
      </SessionProvider>
    </RouterProvider>
  );
}

const applyConfig = (el: HTMLElement, config: Nullish<UserConfig>) => {
  el.dataset.groove = config?.groove ?? "heavy";
  el.dataset.theme = config?.theme ?? "system";
};

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const loaderData = Route.useLoaderData();
  const session = useSession();
  const { data: config } = useQuery({
    ...useOptionsCreator(getUserConfig, session?.user.id),
    initialData: loaderData.config,
  });
  useIsomorphicLayoutEffect(() => {
    applyConfig(document.documentElement, config);
  }, [config]);
  return (
    <html
      ref={(ref) => {
        if (ref) applyConfig(ref, config);
      }}
    >
      <head>
        <Meta />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
