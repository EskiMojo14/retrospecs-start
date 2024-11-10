import type { ReactNode } from "react";
import { createContext, forwardRef, useMemo, useState } from "react";
import type {
  TabListProps as AriaTabListProps,
  TabsProps as AriaTabsProps,
  TabProps as AriaTabProps,
  TabPanelProps as AriaTabPanelProps,
  TabRenderProps,
  ContextValue,
} from "react-aria-components";
import {
  TabList as AriaTabList,
  Tabs as AriaTabs,
  Tab as AriaTab,
  TabPanel as AriaTabPanel,
  useContextProps,
  composeRenderProps,
} from "react-aria-components";
import { useRipple } from "~/hooks/use-ripple";
import type { Color } from "~/theme/colors";
import { bemHelper, mergeRefs } from "~/util";
import "./index.scss";

const cls = bemHelper("tabs");

export interface TabsProps extends Omit<AriaTabsProps, "className"> {
  className?: string;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, ...props }, ref) => (
    <AriaTabs
      {...props}
      ref={ref}
      className={cls({
        extra: className,
      })}
    />
  ),
);

Tabs.displayName = "Tabs";

export interface TabListProps<T extends object>
  extends Omit<AriaTabListProps<T>, "className"> {
  className?: string;
  inlineIcons?: boolean;
  color?: Color;
  variant?: "filled" | "outlined";
}

export const TabList = forwardRef<HTMLDivElement, TabListProps<{}>>(
  ({ className, inlineIcons, color, variant, ...props }, ref) => {
    const tabContextValue = useMemo(
      () => ({ ...(color && { color }), ...(variant && { variant }) }),
      [color, variant],
    );
    return (
      <TabContext.Provider value={tabContextValue}>
        <AriaTabList
          {...props}
          ref={ref}
          className={cls({
            element: "list",
            modifiers: {
              "inline-icons": !!inlineIcons,
            },
            extra: className,
          })}
        />
      </TabContext.Provider>
    );
  },
) as (<T extends object>(props: TabListProps<T>) => React.JSX.Element) & {
  displayName?: string;
};

TabList.displayName = "TabList";

export interface TabProps extends Omit<AriaTabProps, "className"> {
  className?: string;
  icon?: ReactNode | ((props: TabRenderProps) => ReactNode);
  color?: Color;
  variant?: "filled" | "outlined";
}

export const TabContext =
  createContext<ContextValue<TabProps, HTMLElement>>(null);

export const Tab = forwardRef<HTMLButtonElement, TabProps>((props, ref) => {
  [props, ref] = useContextProps(props, ref as never, TabContext) as [
    typeof props,
    typeof ref,
  ];
  const {
    className,
    icon,
    children,
    color = "gold",
    variant = "filled",
    ...rest
  } = props;
  const [isDisabled, setDisabled] = useState(props.isDisabled);
  const { rootRef, surfaceRef } = useRipple({
    disabled: isDisabled,
  });
  return (
    <AriaTab
      {...rest}
      ref={mergeRefs(ref, rootRef)}
      className={({ isDisabled }) => {
        setDisabled(isDisabled);
        return cls({
          element: "tab",
          modifiers: {
            "with-icon": !!icon,
            [variant]: true,
          },
          extra: [className ?? "", "color-" + color],
        });
      }}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          <div ref={surfaceRef} className={cls("tab-ripple")} />
          <div className={cls("tab-content")}>
            {typeof icon === "function" ? icon(renderProps) : icon}
            {children}
          </div>
        </>
      ))}
    </AriaTab>
  );
});

Tab.displayName = "Tab";

export interface TabPanelProps extends Omit<AriaTabPanelProps, "className"> {
  className?: string;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ className, ...props }, ref) => (
    <AriaTabPanel
      {...props}
      ref={ref}
      className={cls({
        element: "panel",
        extra: className,
      })}
    />
  ),
);

TabPanel.displayName = "TabPanel";
