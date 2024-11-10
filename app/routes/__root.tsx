import type { QueryClient } from "@tanstack/react-query";
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
import type { AppSupabaseClient } from "~/db";
import { SupabaseProvider } from "~/db/provider";
import "~/index.scss";

declare module "react-aria-components" {
  interface RouterConfig {
    href: ToOptions["to"];
    routerOptions: Omit<NavigateOptions, keyof ToOptions>;
  }
}

interface AppRouterContext {
  supabase: AppSupabaseClient;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
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
});

function RootComponent() {
  const router = useRouter();
  return (
    <RouterProvider
      navigate={(to, options) => void router.navigate({ to, ...options })}
      useHref={(to) => router.buildLocation({ to }).href}
    >
      <SupabaseProvider>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </SupabaseProvider>
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
