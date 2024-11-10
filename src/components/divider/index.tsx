import { forwardRef } from "react";
import type { SeparatorProps } from "react-aria-components";
import { Separator } from "react-aria-components";
import { bemHelper } from "~/util";
import "./index.scss";

export interface DividerProps extends SeparatorProps {
  hideIfLast?: boolean;
  variant?: "full" | "inset" | "middle";
}

const cls = bemHelper("divider");

export const Divider = forwardRef<object, DividerProps>(
  ({ className, variant = "full", hideIfLast = true, ...props }, ref) => (
    <Separator
      {...props}
      ref={ref}
      className={cls({
        modifiers: {
          [variant]: true,
          "hide-if-last": hideIfLast,
        },
        extra: className,
      })}
    />
  ),
);

Divider.displayName = "Divider";
