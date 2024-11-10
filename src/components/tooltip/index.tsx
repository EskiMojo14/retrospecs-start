import { clsx } from "clsx";
import { forwardRef } from "react";
import type {
  TooltipProps as AriaTooltipProps,
  TooltipTriggerComponentProps,
} from "react-aria-components";
import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
} from "react-aria-components";
import "./index.scss";

export interface TooltipProps extends Omit<AriaTooltipProps, "className"> {
  className?: string;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, ...props }, ref) => (
    <AriaTooltip
      offset={4}
      {...props}
      ref={ref}
      className={clsx("tooltip", className)}
    />
  ),
);

Tooltip.displayName = "Tooltip";

export const TooltipTrigger = (props: TooltipTriggerComponentProps) => (
  <AriaTooltipTrigger delay={1000} closeDelay={1500} {...props} />
);
