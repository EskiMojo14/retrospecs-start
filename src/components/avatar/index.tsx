import type { CollectionProps } from "@react-aria/collections";
import type { ReactNode } from "react";
import { Children, createContext, useMemo } from "react";
import type { ContextValue } from "react-aria-components";
import { Collection, useContextProps } from "react-aria-components";
import { createGenericComponent } from "~/components/generic";
import { useImageIsLoaded } from "~/hooks/use-image-is-loaded";
import type { Color } from "~/theme/colors";
import { bemHelper, pluralize } from "~/util";
import "./index.scss";

export interface AvatarProps {
  src?: string | null;
  name?: string;
  color?: Color;
  size?: "x-small" | "small" | "medium" | "large";
  /** Defaults to "funky" */
  font?: "standard" | "funky";
  className?: string;
  children?: ReactNode | ((props: AvatarRenderProps) => ReactNode);
}

export interface AvatarRenderProps {
  defaultChildren: ReactNode;
}

export interface AvatarPassedProps {
  className: string;
  children: ReactNode;
  "aria-label": string;
}

export const AvatarContext =
  createContext<ContextValue<AvatarProps, HTMLElement>>(null);

const cls = bemHelper("avatar");

export const Avatar = createGenericComponent<
  "span",
  AvatarProps,
  AvatarPassedProps
>("Avatar", "span", (props, ref) => {
  [props, ref] = useContextProps(props, ref as never, AvatarContext) as [
    typeof props,
    typeof ref,
  ];
  const {
    as: As,
    src,
    name = "",
    size = "medium",
    color = "gold",
    className,
    children,
    font = "funky",
    ...rest
  } = props;
  const imageLoaded = useImageIsLoaded(src);
  const defaultChildren =
    src && imageLoaded === "loaded" ? (
      <img src={src} aria-hidden />
    ) : (
      <span aria-hidden>{name[0]}</span>
    );
  return (
    <As
      aria-label={"Avatar for " + name}
      {...rest}
      ref={ref}
      className={cls({
        modifiers: [size, font],
        extra: [className ?? "", "color-" + color],
      })}
    >
      {typeof children === "function"
        ? children({ defaultChildren })
        : (children ?? defaultChildren)}
    </As>
  );
});

const groupCls = bemHelper("avatar-group");

export interface AvatarGroupProps<T extends object>
  extends Pick<CollectionProps<T>, "items" | "children" | "dependencies">,
    Pick<AvatarProps, "font" | "size" | "color"> {
  className?: string;
  spacing?: "small" | "medium" | "large";
  max?: number;
  total?: number;
  renderSurplus?: (surplus: number) => ReactNode;
  id?: string;
}

const defaultRenderSurplus = (surplus: number) => (
  <Avatar aria-label={pluralize`${surplus} more ${[surplus, "avatar"]}`}>
    +{surplus}
  </Avatar>
);

export const AvatarGroup = createGenericComponent<
  "div",
  AvatarGroupProps<object>,
  { className: string; children: ReactNode; id?: string }
>(
  "AvatarGroup",
  "div",
  (
    {
      as: As,
      className,
      max = 5,
      total: totalProp,
      spacing = "medium",
      renderSurplus = defaultRenderSurplus,

      children,
      items: itemsProp,
      dependencies,

      font,
      size,
      color,

      ...props
    },
    ref,
  ) => {
    const avatarContextValue = useMemo(
      () => ({ font, size, color }),
      [font, size, color],
    );

    const itemsAsArray = useMemo(
      () => (itemsProp ? Array.from(itemsProp) : []),
      [itemsProp],
    );
    const slicedItems = useMemo(() => {
      if (itemsAsArray.length <= max) return [...itemsAsArray].reverse();
      return itemsAsArray.slice(0, max - 1).reverse();
    }, [itemsAsArray, max]);
    const childrenAsArray = useMemo(
      () => (typeof children === "function" ? [] : Children.toArray(children)),
      [children],
    );
    const slicedChildren = useMemo(() => {
      if (childrenAsArray.length <= max) return [...childrenAsArray].reverse();
      return childrenAsArray.slice(0, max - 1).reverse();
    }, [childrenAsArray, max]);
    const total =
      totalProp ??
      (typeof children === "function"
        ? itemsAsArray.length
        : childrenAsArray.length);
    return (
      <As
        {...props}
        ref={ref}
        className={groupCls({
          modifiers: { [`spacing-${spacing}`]: true },
          extra: className,
        })}
      >
        <AvatarContext.Provider value={avatarContextValue}>
          {total > max && renderSurplus(total - (max - 1))}
          {typeof children === "function" ? (
            <Collection
              items={slicedItems}
              idScope={props.id}
              {...{ dependencies }}
            >
              {children}
            </Collection>
          ) : (
            slicedChildren
          )}
        </AvatarContext.Provider>
      </As>
    );
  },
) as (<T extends object>(props: AvatarGroupProps<T>) => React.JSX.Element) & {
  displayName: string;
};
