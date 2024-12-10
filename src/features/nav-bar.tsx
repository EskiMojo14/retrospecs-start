import { MDCTopAppBarFoundation } from "@material/top-app-bar";
import type { LinkProps, RegisteredRouter } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AppBar, AppBarRow } from "~/components/app-bar";
import { Breadcrumb, Breadcrumbs } from "~/components/breadcrumbs";
import { ConfirmationDialog } from "~/components/dialog/confirmation";
import { IconButton } from "~/components/icon-button";
import { InternalLink } from "~/components/link";
import { Symbol } from "~/components/symbol";
import { Toolbar } from "~/components/toolbar";
import { useSupabase } from "~/db/provider";
import { useIsomorphicLayoutEffect } from "~/hooks/use-isomorphic-layout-effect";
import type { PickRequired } from "~/util/types";
import { Invites } from "./invites/invites";
import { Logo } from "./logo";
import { PreferencesDialog } from "./user_config/dialog";
import styles from "./nav-bar.module.scss";

function useNavBarScroll() {
  const [navBarRef, setNavBarRef] = useState<HTMLElement | null>(null);
  const foundation = useMemo(
    () =>
      navBarRef &&
      new MDCTopAppBarFoundation({
        addClass(className) {
          navBarRef.classList.add(className);
        },
        removeClass(className) {
          navBarRef.classList.remove(className);
        },
        hasClass: (className) => navBarRef.classList.contains(className),
        setStyle(property, value) {
          navBarRef.style.setProperty(
            property === "top" ? "--top" : property,
            value,
          );
        },
        getTopAppBarHeight() {
          const height = navBarRef.clientHeight;
          navBarRef.style.setProperty("--app-bar-height", `${height}px`);
          return height;
        },
        getViewportScrollY: () => window.scrollY,
      }),
    [navBarRef],
  );

  useIsomorphicLayoutEffect(() => {
    if (!foundation) return;
    const ac = new AbortController();

    window.addEventListener(
      "scroll",
      foundation.handleTargetScroll.bind(foundation),
      { signal: ac.signal },
    );
    window.addEventListener(
      "resize",
      foundation.handleWindowResize.bind(foundation),
      { signal: ac.signal },
    );

    foundation.init();

    return () => {
      foundation.destroy();
      ac.abort();
    };
  }, [foundation]);

  return setNavBarRef;
}

export type NavItem<TTo extends string | undefined = "."> = Omit<
  PickRequired<LinkProps<"a", RegisteredRouter, string, TTo>, "to">,
  "children"
> & {
  label: ReactNode;
  // defaults to href
  id?: string;
};

export interface NavBarProps<TTos extends ReadonlyArray<string | undefined>> {
  breadcrumbs?: { [I in keyof TTos]: NavItem<TTos[I]> };
  actions?: ReactNode;
}

const emptyArray: Array<never> = [];

export function NavBar<TTos extends ReadonlyArray<string | undefined> = []>({
  breadcrumbs = emptyArray as never,
  actions,
}: NavBarProps<TTos>) {
  const navBarRef = useNavBarScroll();
  const router = useRouter();
  const supabase = useSupabase();

  return (
    <AppBar ref={navBarRef} className={styles.navBar}>
      <AppBarRow className={styles.mainRow}>
        <Toolbar as="nav" slot="nav" aria-label="Breadcrumbs">
          <InternalLink to="/">
            <Logo aria-label="Home" />
          </InternalLink>
          <Breadcrumbs items={breadcrumbs}>
            {({ to, label, id = to, ...props }) => (
              <Breadcrumb id={id}>
                <InternalLink to={to} {...(props as any)}>
                  {label}
                </InternalLink>
              </Breadcrumb>
            )}
          </Breadcrumbs>
        </Toolbar>
        <Toolbar slot="actions">
          {actions ?? <Invites />}
          <ConfirmationDialog
            trigger={
              <IconButton slot="action" tooltip="Sign out">
                <Symbol>logout</Symbol>
              </IconButton>
            }
            title="Sign out"
            description="Are you sure you want to sign out?"
            confirmButtonProps={{
              children: "Sign out",
              color: "red",
            }}
            onConfirm={() => {
              void supabase.auth
                .signOut()
                .then(() => router.navigate({ to: "/sign-in" }));
            }}
          />
          <PreferencesDialog />
        </Toolbar>
      </AppBarRow>
    </AppBar>
  );
}
