import type {
  ComponentPropsWithoutRef,
  ContextType,
  ReactNode,
  RefAttributes,
} from "react";
import { createContext, useMemo } from "react";
import type {
  GridListItemProps,
  GridListProps,
  ContextValue,
} from "react-aria-components";
import {
  DEFAULT_SLOT,
  GridList,
  GridListItem,
  useContextProps,
  Text,
  composeRenderProps,
} from "react-aria-components";
import { SymbolContext } from "~/components/symbol";
import { Typography } from "~/components/typography";
import { useRipple } from "~/hooks/use-ripple";
import type { Color } from "~/theme/colors";
import { bemHelper, mergeRefs } from "~/util";
import "./index.scss";

export type ListVariant = "one-line" | "two-line" | "three-line";

const cls = bemHelper("list");

export { cls as listCls };

export interface ListProps<T>
  extends Omit<GridListProps<T>, "className">,
    Pick<ListItemProps<any>, "nonInteractive" | "color"> {
  variant: ListVariant;
  className?: string;
}

type ListItemContextValue = ContextValue<
  Pick<ListItemProps<any>, "nonInteractive" | "color">,
  HTMLElement
>;

export const ListItemContext = createContext<ListItemContextValue>(null);

export const List = <T extends object>({
  variant,
  nonInteractive,
  className,
  color,
  ...props
}: ListProps<T>) => {
  const listItemContextValue = useMemo<ListItemContextValue>(
    () => ({ nonInteractive, ...(color && { color }) }),
    [nonInteractive, color],
  );
  return (
    <ListItemContext.Provider value={listItemContextValue}>
      <GridList
        {...props}
        className={cls({
          modifier: variant,
          extra: className,
        })}
      />
    </ListItemContext.Provider>
  );
};

export interface ListItemProps<T>
  extends Omit<GridListItemProps<T>, "className"> {
  nonInteractive?: boolean;
  className?: string;
  color?: Color;
}

const symbolContextValue: ContextType<typeof SymbolContext> = {
  slots: {
    [DEFAULT_SLOT]: {},
    icon: { className: cls("icon") },
  },
};

export const ListItem = <T extends object>({
  ref,
  ...props
}: ListItemProps<T> & RefAttributes<HTMLDivElement>) => {
  [props, ref] = useContextProps(props, ref as never, ListItemContext) as [
    typeof props,
    typeof ref,
  ];
  const {
    nonInteractive,
    className,
    children,
    color = "gold",
    ...rest
  } = props;
  const { rootRef, surfaceRef } = useRipple({
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    disabled: props.isDisabled || nonInteractive,
  });
  return (
    <GridListItem
      ref={mergeRefs(ref, rootRef) as never}
      {...rest}
      className={cls({
        element: "item",
        modifiers: {
          "non-interactive": !!nonInteractive,
        },
        extra: ["color-" + color, className ?? ""],
      })}
    >
      {composeRenderProps(children, (children) => (
        <SymbolContext.Provider value={symbolContextValue}>
          <div ref={surfaceRef} className={cls("item-ripple")} />
          <div className={cls("item-content")}>{children}</div>
        </SymbolContext.Provider>
      ))}
    </GridListItem>
  );
};

interface ListItemTextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">,
    RefAttributes<HTMLDivElement> {
  headline: ReactNode;
  overline?: ReactNode;
  supporting?: ReactNode;
}

export const ListItemText = ({
  className,
  overline,
  headline,
  supporting,
  ...props
}: ListItemTextProps) => (
  <div
    {...props}
    className={cls({
      element: "item-text",
      modifiers: {
        "no-overline": !overline,
      },
      extra: className,
    })}
  >
    {!!overline && <Typography variant="overline">{overline}</Typography>}
    <Typography variant="subtitle1" as={Text} slot="description">
      {headline}
    </Typography>
    {!!supporting && <Typography variant="caption">{supporting}</Typography>}
  </div>
);
