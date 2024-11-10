import type { ReactNode } from "react";
import { LineBackground } from "~/components/line-background";
import { Footer } from "./footer";
import type { NavBarProps } from "./nav-bar";
import { NavBar } from "./nav-bar";

interface LayoutProps extends NavBarProps {
  children: ReactNode;
}

export function Layout({ children, ...props }: LayoutProps) {
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
