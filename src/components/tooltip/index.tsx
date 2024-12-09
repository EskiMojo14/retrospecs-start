import { clsx } from "clsx";
import type { RefAttributes } from "react";
import type {
  TooltipProps as AriaTooltipProps,
  TooltipTriggerComponentProps,
} from "react-aria-components";
import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
} from "react-aria-components";
import "./index.scss";

export interface TooltipProps
  extends Omit<AriaTooltipProps, "className">,
    RefAttributes<HTMLDivElement> {
  className?: string;
}

export const Tooltip = ({ className, ...props }: TooltipProps) => (
  <AriaTooltip offset={4} {...props} className={clsx("tooltip", className)} />
);

Tooltip.displayName = "Tooltip";

export const TooltipTrigger = (props: TooltipTriggerComponentProps) => (
  <AriaTooltipTrigger delay={1000} closeDelay={1500} {...props} />
);
