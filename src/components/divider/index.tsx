import type { ReactNode, RefAttributes } from "react";
import type { Key, SeparatorProps } from "react-aria-components";
import { Separator } from "react-aria-components";
import { bemHelper } from "~/util";
import "./index.scss";

export interface DividerProps extends SeparatorProps, RefAttributes<object> {
  hideIfLast?: boolean;
  variant?: "full" | "inset" | "middle";
}

const cls = bemHelper("divider");

export const Divider = ({
  className,
  variant = "full",
  hideIfLast = true,
  ...props
}: DividerProps) => (
  <Separator
    {...props}
    className={cls({
      modifiers: {
        [variant]: true,
        "hide-if-last": hideIfLast,
      },
      extra: className,
    })}
  />
);

export interface DividerContainerProps
  extends Omit<DividerProps, "variant" | "id"> {
  children: ReactNode;
  id: Key;
  position?: "before" | "after";
  variant?: DividerProps["variant"] | "none";
}

export const DividerContainer = ({
  position = "after",
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id: _id,
  variant,
  ...props
}: DividerContainerProps) => {
  const divider = variant !== "none" && (
    <Divider variant={variant} {...props} />
  );
  return (
    <>
      {position === "before" && divider}
      {children}
      {position === "after" && divider}
    </>
  );
};
