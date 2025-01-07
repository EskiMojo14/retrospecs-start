import { clsx } from "clsx";
import type { ContextType, ReactNode, RefAttributes } from "react";
import { createContext, useMemo } from "react";
import type {
  MenuProps as AriaMenuProps,
  MenuItemProps as AriaMenuItemProps,
  MenuTriggerProps as AriaMenuTriggerProps,
  SubmenuTriggerProps,
  ContextValue,
} from "react-aria-components";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  Text,
  MenuTrigger,
  SubmenuTrigger,
  useContextProps,
  composeRenderProps,
} from "react-aria-components";
import type { PopoverProps } from "~/components/popover";
import { Popover } from "~/components/popover";
import { Symbol, SymbolContext } from "~/components/symbol";
import { Typography } from "~/components/typography";
import { useRipple } from "~/hooks/use-ripple";
import type { Color } from "~/theme/colors";
import { bemHelper, mergeRefs } from "~/util";
import type { DistributiveOmit } from "~/util/types";
import "./index.scss";

type MenuTriggerProps =
  | {
      isSubMenu?: false;
      trigger: ReactNode;
      triggerProps?: Omit<AriaMenuTriggerProps, "children">;
    }
  | {
      isSubMenu: true;
      trigger: React.JSX.Element;
      triggerProps?: Omit<SubmenuTriggerProps, "children">;
    };

export type MenuProps<T extends object> = AriaMenuProps<T> &
  MenuTriggerProps & {
    variant?: "one-line" | "two-line";
    popoverProps?: DistributiveOmit<PopoverProps, "children">;
    color?: Color;
  };

type MenuContextValue = ContextValue<
  Omit<MenuProps<any>, "trigger" | "triggerProps" | "isSubmenu">,
  HTMLDivElement
>;

export const MenuContext = createContext<MenuContextValue>(null);

const cls = bemHelper("menu");

export const Menu = <T extends object>({
  ref,
  ...props
}: MenuProps<T> & RefAttributes<HTMLDivElement>) => {
  [props, ref] = useContextProps(props, ref as never, MenuContext) as [
    typeof props,
    typeof ref,
  ];
  const {
    children,
    className,
    variant = "one-line",
    color = "gold",
    popoverProps,
    trigger,
    triggerProps,
    isSubMenu,
  } = props;
  const contextValue = useMemo<MenuContextValue>(() => ({ color }), [color]);
  const popover = (
    <MenuContext.Provider value={contextValue}>
      <Popover
        offset={0}
        containerPadding={variant === "two-line" ? 64 : 56}
        {...popoverProps}
        className={clsx(
          "menu-popover",
          "color-" + color,
          popoverProps?.className,
        )}
      >
        <AriaMenu
          {...props}
          ref={ref}
          className={cls({
            modifiers: {
              [variant]: true,
            },
            extra: className,
          })}
        >
          {children}
        </AriaMenu>
      </Popover>
    </MenuContext.Provider>
  );
  return isSubMenu ? (
    <SubmenuTrigger {...triggerProps}>
      {trigger}
      {popover}
    </SubmenuTrigger>
  ) : (
    <MenuTrigger {...triggerProps}>
      {trigger}
      {popover}
    </MenuTrigger>
  );
};

const symbolContextValue: ContextType<typeof SymbolContext> = {
  slots: {
    leading: {
      className: cls("item-icon", "leading"),
    },
    trailing: {
      className: cls("item-icon", "trailing"),
    },
    check: {
      className: cls("item-icon", "check"),
    },
    submenu: {
      className: cls("item-icon", "submenu"),
    },
  },
};

export interface MenuItemProps<T extends object>
  extends Omit<AriaMenuItemProps<T>, "className"> {
  className?: string;
}

export const MenuItem = <T extends object>({
  children,
  className,
  ref,
  ...props
}: MenuItemProps<T> & RefAttributes<HTMLElement>) => {
  const { surfaceRef, rootRef } = useRipple({ disabled: props.isDisabled });
  return (
    <AriaMenuItem
      {...props}
      ref={mergeRefs(ref, rootRef) as never}
      className={cls({
        element: "item",
        extra: className,
      })}
    >
      {composeRenderProps(children, (children, { isSelected, hasSubmenu }) => (
        <SymbolContext.Provider value={symbolContextValue}>
          <div ref={surfaceRef} className={cls("item-ripple")} />
          <div className={cls("item-content")}>
            {isSelected && <Symbol slot="check">check</Symbol>}
            {children}
            {hasSubmenu && (
              <Symbol slot="submenu" flipRtl>
                chevron_right
              </Symbol>
            )}
          </div>
        </SymbolContext.Provider>
      ))}
    </AriaMenuItem>
  );
};

export interface MenuItemTextProps extends RefAttributes<HTMLDivElement> {
  label: ReactNode;
  description?: ReactNode;
}

export const MenuItemText = ({
  label,
  description,
  ref,
}: MenuItemTextProps) => (
  <div ref={ref} className={cls("item-text")}>
    <Typography variant="body1" as={Text} slot="label">
      {label}
    </Typography>
    {!!description && (
      <Typography variant="caption" as={Text} slot="description">
        {description}
      </Typography>
    )}
  </div>
);
