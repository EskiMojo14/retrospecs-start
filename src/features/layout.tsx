import type { ReactNode } from "react";
import { LineBackground } from "~/components/line-background";
import { Footer } from "./footer";
import type { NavBarProps } from "./nav-bar";
import { NavBar } from "./nav-bar";

interface LayoutProps<Options extends ReadonlyArray<any>>
  extends NavBarProps<Options> {
  children: ReactNode;
}

export function Layout<Options extends ReadonlyArray<any>>({
  children,
  ...props
}: LayoutProps<Options>) {
  return (
    <>
      <NavBar {...props} />
      <main>
        <LineBackground opacity={0.5}>{children}</LineBackground>
      </main>
      <Footer />
    </>
  );
}
