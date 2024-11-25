import type { ReactNode } from "react";
import { LineBackground } from "~/components/line-background";
import { Footer } from "./footer";
import type { NavBarProps } from "./nav-bar";
import { NavBar } from "./nav-bar";

interface LayoutProps<TTos extends ReadonlyArray<string | undefined>>
  extends NavBarProps<TTos> {
  children: ReactNode;
}

export function Layout<TTos extends ReadonlyArray<string | undefined> = []>({
  children,
  ...props
}: LayoutProps<TTos>) {
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
