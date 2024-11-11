import { clsx } from "clsx";
import { createContext, forwardRef } from "react";
import type { ContextValue } from "react-aria-components";
import { useContextProps } from "react-aria-components";
// eslint-disable-next-line import-x/no-unresolved
import logo from "/assets/retrospecs.png";
import type { ExternalLinkProps } from "~/components/link";
import { ExternalLink } from "~/components/link";
import styles from "./logo.module.scss";

export const LogoContext =
  createContext<ContextValue<ExternalLinkProps, HTMLAnchorElement>>(null);

export const Logo = forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  (props, ref) => {
    [props, ref] = useContextProps(props, ref, LogoContext);
    const { className, ...rest } = props;
    return (
      <ExternalLink
        ref={ref}
        {...rest}
        className={clsx(styles.logo, className)}
      >
        <img src={logo} alt="RetroSpecs" />
        <h6 className={styles.wordmark}>RetroSpecs</h6>
      </ExternalLink>
    );
  },
);

Logo.displayName = "Logo";
