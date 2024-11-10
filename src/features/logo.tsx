import { clsx } from "clsx";
import { createContext, forwardRef } from "react";
import type { ContextValue } from "react-aria-components";
import { useContextProps } from "react-aria-components";
// eslint-disable-next-line import-x/no-unresolved
import logo from "/assets/retrospecs.png";
import type { LinkProps } from "~/components/link";
import { Link } from "~/components/link";
import styles from "./logo.module.scss";

export const LogoContext =
  createContext<ContextValue<LinkProps, HTMLAnchorElement>>(null);

export const Logo = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  [props, ref] = useContextProps(props, ref, LogoContext);
  const { className, ...rest } = props;
  return (
    <Link ref={ref} {...rest} className={clsx(styles.logo, className)}>
      <img src={logo} alt="RetroSpecs" />
      <h6 className={styles.wordmark}>RetroSpecs</h6>
    </Link>
  );
});

Logo.displayName = "Logo";
