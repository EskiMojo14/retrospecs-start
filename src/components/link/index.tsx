import { filterDOMProps } from "@react-aria/utils";
import type { LinkComponent } from "@tanstack/react-router";
import { createLink } from "@tanstack/react-router";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { forwardRef } from "react";
import type { AriaLinkOptions } from "react-aria";
import { mergeProps, useFocusRing, useHover, useLink } from "react-aria";
import type { LinkProps, SlotProps } from "react-aria-components";
import { Link, LinkContext, useContextProps } from "react-aria-components";
import { bemHelper } from "~/util";
import "./index.scss";

export interface ExternalLinkProps extends Omit<LinkProps, "className"> {
  className?: string;
}

const cls = bemHelper("link");

export const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  ({ className, ...props }, ref) => (
    <Link
      ref={ref}
      {...props}
      className={cls({
        extra: className,
      })}
    />
  ),
);

ExternalLink.displayName = "ExternalLink";

interface _InternalLinkProps
  extends Omit<AriaLinkOptions, "href" | "elementType">,
    SlotProps {
  children?: ReactNode;
  className?: string;
}

const propNames = new Set([
  "children",
  "onFocus",
  "onMouseEnter",
  "onMouseLeave",
  "onTouchStart",
  "target",
  "style",
  "role",
  "aria-disabled",
  "data-status",
  "aria-current",
  "data-transitioning",
] satisfies Array<
  keyof _InternalLinkProps | keyof ComponentPropsWithRef<"a"> | `data-${string}`
>);

const _InternalLinkComponent = forwardRef<
  HTMLAnchorElement,
  _InternalLinkProps
>((props, ref) => {
  [props, ref] = useContextProps(props, ref, LinkContext);
  const { onClick, ...rest } = props as _InternalLinkProps &
    ComponentPropsWithRef<"a">;
  const { isPressed, linkProps } = useLink(rest, ref);
  const { isHovered, hoverProps } = useHover(props);
  const { isFocusVisible, isFocused, focusProps } = useFocusRing(props);
  return (
    <a
      {...mergeProps(
        linkProps,
        hoverProps,
        focusProps,
        filterDOMProps(props, {
          isLink: true,
          propNames,
        }),
      )}
      ref={ref}
      data-hovered={isHovered || undefined}
      data-pressed={isPressed || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-focused={isFocused || undefined}
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      data-disabled={props.isDisabled || undefined}
      slot={props.slot ?? undefined}
      className={cls({ extra: props.className })}
      onClick={onClick}
    />
  );
});

_InternalLinkComponent.displayName = "InternalLink";

const CreatedLinkComponent = createLink(_InternalLinkComponent);

export const InternalLink: LinkComponent<typeof _InternalLinkComponent> = (
  props,
) => <CreatedLinkComponent {...props} />;
