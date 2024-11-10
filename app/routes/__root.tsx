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
import { ForeEauFore } from "~/404";
import { BreakpointDisplay } from "~/components/grid";
import { GlobalToastRegion } from "~/components/toast/toast-region";
import { SessionProvider } from "~/db/provider";
import { ErrorPage } from "~/error-page";
import type { AppContext } from "~/util/supabase-query";
import "~/index.scss";

declare module "react-aria-components" {
  interface RouterConfig {
    href: ToOptions["to"];
    routerOptions: Omit<NavigateOptions, keyof ToOptions>;
  }
}

export const Route = createRootRouteWithContext<AppContext>()({
  meta: () => [
    {
      charSet: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      title: "TanStack Start Starter",
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
          <ReactQueryDevtools
            buttonPosition="bottom-left"
            initialIsOpen={false}
          />
          <BreakpointDisplay />
        </RootDocument>
      </SessionProvider>
    </RouterProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
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
