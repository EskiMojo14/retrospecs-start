import { clsx } from "clsx";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";
import { createContext } from "react";
import type { ContextValue } from "react-aria-components";
import { useContextProps } from "react-aria-components";
// eslint-disable-next-line import-x/no-unresolved
import logo from "/assets/retrospecs.png";
import styles from "./logo.module.scss";

export const LogoContext =
  createContext<ContextValue<ComponentPropsWithoutRef<"div">, HTMLDivElement>>(
    null,
  );

export const Logo = ({ ref, ...props }: ComponentProps<"div">) => {
  [props, ref] = useContextProps(props, ref as never, LogoContext);
  const { className, ...rest } = props;
  return (
    <div {...rest} className={clsx(styles.logo, className)}>
      <img src={logo} alt="RetroSpecs" />
      <h6 className={styles.wordmark}>RetroSpecs</h6>
    </div>
  );
};
