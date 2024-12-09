import { clsx } from "clsx";
import type { RefAttributes } from "react";
import type { PopoverProps as AriaPopoverProps } from "react-aria-components";
import {
  Popover as AriaPopover,
  composeRenderProps,
} from "react-aria-components";
import type { LineBackgroundProps } from "~/components/line-background";
import { LineBackground } from "~/components/line-background";
import type { Compute, OneOf } from "~/util/types";
import "./index.scss";

type BackgroundProps = OneOf<
  | {
      withBg?: true;
      backgroundProps?: LineBackgroundProps;
    }
  | {
      withBg: false;
    }
>;

export type PopoverProps = Compute<
  Omit<AriaPopoverProps, "className"> &
    BackgroundProps & {
      className?: string;
    } & RefAttributes<HTMLElement>
>;

export const Popover = ({
  children,
  className,
  withBg = true,
  backgroundProps,
  ...props
}: PopoverProps) => (
  <AriaPopover offset={8} {...props} className={clsx("popover", className)}>
    {composeRenderProps(children, (children) =>
      withBg ? (
        <LineBackground opacity={0.3} {...backgroundProps}>
          {children}
        </LineBackground>
      ) : (
        children
      ),
    )}
  </AriaPopover>
);
