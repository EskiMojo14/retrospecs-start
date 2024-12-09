import type { RefAttributes } from "react";
import type { SeparatorProps } from "react-aria-components";
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
