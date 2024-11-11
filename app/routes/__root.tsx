import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { NavigateOptions, ToOptions } from "@tanstack/react-router";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";
import { RouterProvider } from "react-aria-components";
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
import "~/index.scss";

const { TanStackRouterDevtools } =
  process.env.NODE_ENV === "development"
    ? lazily(() => import("@tanstack/router-devtools"))
    : { TanStackRouterDevtools: () => null };

declare module "react-aria-components" {
  interface RouterConfig {
    href: ToOptions["to"];
    routerOptions: Omit<NavigateOptions, keyof ToOptions>;
  }
}

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
  meta: () => [
    {
      charSet: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
  ],
  links: () => [{ rel: "icon", href: "/assets/retrospecs.png" }],
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
  const router = useRouter();
  return (
    <RouterProvider
      navigate={(to, options) => void router.navigate({ to, ...options })}
      useHref={(to) => router.buildLocation({ to }).href}
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

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { config } = Route.useLoaderData();
  useIsomorphicLayoutEffect(() => {
    document.documentElement.dataset.groove = config?.groove ?? "heavy";
    document.documentElement.dataset.theme = config?.theme ?? "system";
  }, [config]);
  return (
    <Html>
      <Head>
        <Meta />
      </Head>
      <Body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </Body>
    </Html>
  );
}
