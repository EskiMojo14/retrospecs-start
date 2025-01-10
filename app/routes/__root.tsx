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
import { Suspense, type ReactNode } from "react";
import { RouterProvider } from "react-aria-components";
import { lazily } from "react-lazily";
import { ensureAuthenticatedMw } from "@/middleware/auth";
import { queryClientMw } from "@/middleware/query-client";
import { ForeEauFore } from "~/404";
import { BreakpointDisplay } from "~/components/grid";
import { GlobalToastRegion } from "~/components/toast/toast-region";
import { SessionProvider, useSession } from "~/db/provider";
import { ensureHydrated, withDehydratedState } from "~/db/query";
import type { Profile } from "~/features/profiles";
import { getProfile } from "~/features/profiles";
import type { UserConfig } from "~/features/user_config";
import { getUserConfig } from "~/features/user_config";
import { useIsomorphicLayoutEffect } from "~/hooks/use-isomorphic-layout-effect";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import rootCss from "~/index.scss?url";
import { getUrl } from "~/util/isomorphic";
import { promiseOwnProperties } from "~/util/ponyfills";
import type { AppContext } from "~/util/supabase-query";
import type { MaybePromise, Nullish } from "~/util/types";

const { TanStackRouterDevtools = () => null } =
  process.env.NODE_ENV === "development"
    ? lazily(() => import("@tanstack/router-devtools"))
    : {};

interface RootLoaderResponse {
  config?: UserConfig | null;
  profile?: Profile;
}

const getUserData = createServerFn({ method: "GET" })
  .middleware([ensureAuthenticatedMw, queryClientMw])
  .handler(({ context, context: { queryClient, user } }) =>
    withDehydratedState(
      promiseOwnProperties({
        profile: queryClient.ensureQueryData(getProfile(context, user.id)),
        config: queryClient.ensureQueryData(getUserConfig(context, user.id)),
      }) satisfies Promise<RootLoaderResponse>,
      queryClient,
    ),
  );

const noAuthRoutes = new Set(["/sign-in", "/auth/callback"]);

export const Route = createRootRouteWithContext<AppContext>()({
  loader: ({ context }): MaybePromise<RootLoaderResponse> => {
    const url = getUrl();
    if (noAuthRoutes.has(url.pathname)) {
      return {};
    }
    return ensureHydrated(getUserData(), context);
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
    links: [
      { rel: "icon", href: "/assets/retrospecs.png" },
      { rel: "stylesheet", href: rootCss },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <ForeEauFore />,
});
declare module "react-aria-components" {
  interface RouterConfig {
    href: ToOptions["to"] | (string & {});
    routerOptions: Omit<NavigateOptions, keyof ToOptions>;
  }
}

function isAbsoluteUrl(url: string) {
  return new RegExp(`(^|:)//`).test(url);
}

function RootComponent() {
  const router = useRouter();
  return (
    <RouterProvider
      navigate={(to, options) => {
        if (to && isAbsoluteUrl(to)) {
          window.location.href = to;
        } else {
          void router.navigate({ to, ...options });
        }
      }}
      useHref={(to) =>
        to && isAbsoluteUrl(to) ? to : router.buildLocation({ to }).href
      }
    >
      <SessionProvider>
        <RootDocument>
          <Outlet />
          <GlobalToastRegion aria-label="Notifications" />
          <Suspense>
            <ReactQueryDevtools buttonPosition="bottom-left" />
            <TanStackRouterDevtools position="bottom-right" />
          </Suspense>
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
