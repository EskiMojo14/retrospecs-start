import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { createContext, forwardRef } from "react";
import type { ContextValue } from "react-aria-components";
import { useContextProps } from "react-aria-components";
// eslint-disable-next-line import-x/no-unresolved
import logo from "/assets/retrospecs.png";
import styles from "./logo.module.scss";

export const LogoContext =
  createContext<ContextValue<ComponentPropsWithoutRef<"div">, HTMLDivElement>>(
    null,
  );

export const Logo = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  (props, ref) => {
    [props, ref] = useContextProps(props, ref, LogoContext);
    const { className, ...rest } = props;
    return (
      <div {...rest} className={clsx(styles.logo, className)}>
        <img src={logo} alt="RetroSpecs" />
        <h6 className={styles.wordmark}>RetroSpecs</h6>
      </div>
    );
  },
);

Logo.displayName = "Logo";
