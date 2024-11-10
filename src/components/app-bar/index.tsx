import { forwardRef, type ContextType, type ReactNode } from "react";
import { DEFAULT_SLOT, TooltipContext } from "react-aria-components";
import { ButtonContext } from "~/components/button";
import { Provider } from "~/components/provider";
import { ToolbarContext } from "~/components/toolbar";
import { LogoContext } from "~/features/logo";
import { bemHelper } from "~/util";
import "./index.scss";

export interface AppBarProps {
  children?: ReactNode;
  className?: string;
}

const cls = bemHelper("app-bar");

const toolbarContextValue: ContextType<typeof ToolbarContext> = {
  slots: {
    [DEFAULT_SLOT]: {
      className: cls("section"),
    },
    nav: {
      align: "start",
      className: cls("section", "nav"),
    },
    actions: {
      align: "end",
      className: cls("section", "actions"),
    },
  },
};

const logoContextValue: ContextType<typeof LogoContext> = {
  slots: {
    [DEFAULT_SLOT]: {
      className: cls("logo"),
    },
  },
};

const buttonContextValue: ContextType<typeof ButtonContext> = {
  slots: {
    [DEFAULT_SLOT]: {},
    action: {
      color: "inherit",
    },
  },
};

const tooltipContextValue: ContextType<typeof TooltipContext> = {
  slots: {
    [DEFAULT_SLOT]: {
      placement: "bottom",
    },
  },
};

export const AppBar = forwardRef<HTMLElement, AppBarProps>(
  ({ children, className }, ref) => (
    <header
      ref={ref}
      className={cls({
        extra: className,
      })}
      data-theme="dark"
    >
      <Provider
        values={[
          [ToolbarContext, toolbarContextValue],
          [LogoContext, logoContextValue],
          [ButtonContext, buttonContextValue],
          [TooltipContext, tooltipContextValue],
        ]}
      >
        {children}
      </Provider>
    </header>
  ),
);

AppBar.displayName = "AppBar";

export function AppBarRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cls({
        element: "row",
        extra: className,
      })}
    >
      {children}
    </div>
  );
}
