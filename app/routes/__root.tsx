import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";
import { lazily } from "react-lazily";
import { ForeEauFore } from "~/404";
import { BreakpointDisplay } from "~/components/grid";
import { GlobalToastRegion } from "~/components/toast/toast-region";
import { ensureAuthenticated } from "~/db/auth";
import { SessionProvider } from "~/db/provider";
import { ErrorPage } from "~/error-page";
import type { Profile } from "~/features/profiles";
import { getProfile } from "~/features/profiles";
import type { UserConfig } from "~/features/user_config";
import { getUserConfig } from "~/features/user_config";
import { useIsomorphicLayoutEffect } from "~/hooks/use-isomorphic-layout-effect";
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

const noAuthRoutes = new Set(["/sign-in", "/auth/callback"]);

export const Route = createRootRouteWithContext<AppContext>()({
  loader: async ({
    context,
    context: { queryClient },
  }): Promise<RootLoaderResponse> => {
    const url = await getUrl();
    if (noAuthRoutes.has(url.pathname)) {
      return {};
    }
    const user = await ensureAuthenticated(context);
    return {
      ...(await promiseOwnProperties({
        profile: queryClient.ensureQueryData(getProfile(context, user.id)),
        config: queryClient.ensureQueryData(getUserConfig(context, user.id)),
      })),
    };
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

function RootComponent() {
  return (
    <SessionProvider>
      <RootDocument>
        <Outlet />
        <GlobalToastRegion aria-label="Notifications" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <TanStackRouterDevtools position="bottom-right" />
        <BreakpointDisplay />
      </RootDocument>
    </SessionProvider>
  );
}

const applyConfig = (el: HTMLElement, config: Nullish<UserConfig>) => {
  el.dataset.groove = config?.groove ?? "heavy";
  el.dataset.theme = config?.theme ?? "system";
};

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { config } = Route.useLoaderData();
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
