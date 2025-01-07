import { createContext } from "react";
import type { ContextValue } from "react-aria-components";
import { Toolbar as AriaToolbar, useContextProps } from "react-aria-components";
import { createGenericComponent } from "~/components/generic";
import { bemHelper } from "~/util";
import "./index.scss";

export interface ToolbarProps {
  align?: "start" | "center" | "end";
  className?: string;
}

export const ToolbarContext =
  createContext<ContextValue<ToolbarProps, HTMLElement>>(null);

export interface ToolbarPassedProps {
  className: string;
}

const cls = bemHelper("toolbar");

export const Toolbar = createGenericComponent<
  typeof AriaToolbar,
  ToolbarProps,
  ToolbarPassedProps
>("Toolbar", AriaToolbar, ({ ref, ...props }) => {
  [props, ref] = useContextProps(props, ref as never, ToolbarContext) as [
    typeof props,
    typeof ref,
  ];
  const { align = "center", className, as: As, ...rest } = props;
  return (
    <As
      ref={ref}
      {...rest}
      className={cls({
        modifier: `align-${align}`,
        extra: className,
      })}
    />
  );
});
