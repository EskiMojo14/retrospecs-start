import type { ReactNode, RefAttributes } from "react";
import { createContext, useMemo, useState } from "react";
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

export interface TabsProps
  extends Omit<AriaTabsProps, "className">,
    RefAttributes<HTMLDivElement> {
  className?: string;
}

export const Tabs = ({ className, ...props }: TabsProps) => (
  <AriaTabs
    {...props}
    className={cls({
      extra: className,
    })}
  />
);

export interface TabListProps<T extends object>
  extends Omit<AriaTabListProps<T>, "className">,
    RefAttributes<HTMLDivElement> {
  className?: string;
  inlineIcons?: boolean;
  color?: Color;
  variant?: "filled" | "outlined";
}

export const TabList = <T extends object>({
  className,
  inlineIcons,
  color,
  variant,
  ...props
}: TabListProps<T>) => {
  const tabContextValue = useMemo(
    () => ({ ...(color && { color }), ...(variant && { variant }) }),
    [color, variant],
  );
  return (
    <TabContext value={tabContextValue}>
      <AriaTabList
        {...props}
        className={cls({
          element: "list",
          modifiers: {
            "inline-icons": !!inlineIcons,
          },
          extra: className,
        })}
      />
    </TabContext>
  );
};

export interface TabProps extends Omit<AriaTabProps, "className"> {
  className?: string;
  icon?: ReactNode | ((props: TabRenderProps) => ReactNode);
  color?: Color;
  variant?: "filled" | "outlined";
}

export const TabContext =
  createContext<ContextValue<TabProps, HTMLElement>>(null);

export const Tab = ({
  ref,
  ...props
}: TabProps & RefAttributes<HTMLButtonElement>) => {
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
};

export interface TabPanelProps
  extends Omit<AriaTabPanelProps, "className">,
    RefAttributes<HTMLDivElement> {
  className?: string;
}

export const TabPanel = ({ className, ...props }: TabPanelProps) => (
  <AriaTabPanel
    {...props}
    className={cls({
      element: "panel",
      extra: className,
    })}
  />
);
