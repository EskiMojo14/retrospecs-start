import { MDCTopAppBarFoundation } from "@material/top-app-bar";
import type { LinkOptions, ValidateLinkOptions } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { radEventListeners } from "rad-event-listeners";
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

    const removeListeners = radEventListeners(window, {
      scroll: foundation.handleTargetScroll.bind(foundation),
      resize: foundation.handleWindowResize.bind(foundation),
    });

    foundation.init();

    return () => {
      foundation.destroy();
      removeListeners();
    };
  }, [foundation]);

  return setNavBarRef;
}

export type NavItem<Option> = ValidateLinkOptions<Option> & {
  label: ReactNode;
  // defaults to href
  id?: string;
};

export interface NavBarProps<Options extends ReadonlyArray<any>> {
  breadcrumbs?: { [I in keyof Options]: NavItem<Options[I]> };
  actions?: ReactNode;
}

const emptyArray: Array<never> = [];

export function NavBar<Options extends ReadonlyArray<any>>({
  breadcrumbs = emptyArray as never,
  actions,
}: NavBarProps<Options>) {
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
            {({ label, id, ...props }: NavItem<LinkOptions>) => (
              <Breadcrumb id={id ?? props.to}>
                <InternalLink {...(props as any)}>{label}</InternalLink>
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
