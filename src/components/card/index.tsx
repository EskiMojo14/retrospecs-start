import { clsx } from "clsx";
import type { ContextType, ReactNode, RefCallback } from "react";
import { useMemo } from "react";
import {
  Button as AriaButton,
  ButtonContext as AriaButtonContext,
  DEFAULT_SLOT,
} from "react-aria-components";
import type { ButtonProps } from "~/components/button";
import { ButtonContext } from "~/components/button";
import { createGenericComponent } from "~/components/generic";
import { MergeProvider, Provider } from "~/components/provider";
import { ToolbarContext } from "~/components/toolbar";
import { useRipple } from "~/hooks/use-ripple";
import type { Color } from "~/theme/colors";
import { bemHelper, mergeRefs } from "~/util";
import type { CardVariant } from "./constants";
import "./index.scss";

export interface CardProps {
  color?: Color;
  className?: string;
  children?: ReactNode;
  variant?: CardVariant;
}

const cls = bemHelper("card");

export const Card = createGenericComponent<
  "div",
  CardProps,
  {
    className: string;
    children: ReactNode;
  }
>(
  "Card",
  "div",
  ({
    children,
    color = "gold",
    className,
    variant = "raised",

    as: As,
    ...props
  }) => (
    <As
      {...props}
      className={cls({
        modifiers: {
          [variant]: true,
        },
        extra: [className ?? "", "color-" + color],
      })}
    >
      <div className={cls("bg")} />
      <div className={cls("content")}>{children}</div>
    </As>
  ),
);

interface CardSectionProps {
  className?: string;
  children?: ReactNode;
}

interface CardSectionPassedProps {
  className: string;
  children?: ReactNode;
}

export const CardSection = createGenericComponent<
  "section",
  CardSectionProps,
  CardSectionPassedProps
>("CardSection", "section", ({ as: As, className, ...props }) => (
  <As {...props} className={cls("section", undefined, className)} />
));

interface CardPrimaryActionProps extends CardSectionProps {
  isDisabled?: boolean;
}

interface CardPrimaryActionPassedProps extends CardSectionPassedProps {
  ref: RefCallback<HTMLElement>;
}

export const CardPrimaryAction = createGenericComponent<
  typeof AriaButton,
  CardPrimaryActionProps,
  CardPrimaryActionPassedProps
>("CardPrimaryAction", AriaButton, ({ children, className, ref, ...props }) => {
  const { rootRef, surfaceRef } = useRipple({ disabled: props.isDisabled });
  return (
    <CardSection
      {...props}
      ref={mergeRefs(ref, rootRef as never)}
      className={clsx("card__section--primary-action", className)}
    >
      <span ref={surfaceRef} className={cls("section-ripple")} />
      {children}
    </CardSection>
  );
});

const toolbarContextValue: ContextType<typeof ToolbarContext> = {
  slots: {
    [DEFAULT_SLOT]: {},
    buttons: { align: "start" },
    icons: { align: "end" },
  },
};

interface CardActionsProps
  extends CardSectionProps,
    Pick<ButtonProps, "color"> {}

const ariaButtonContextValue = { slots: { [DEFAULT_SLOT]: {}, action: {} } };

export const CardActions = createGenericComponent<
  "section",
  CardActionsProps,
  CardSectionPassedProps
>(
  "CardActions",
  "section",
  ({ children, className, color = "inherit", ...props }) => {
    const buttonContextValue = useMemo(
      () => ({
        slots: {
          [DEFAULT_SLOT]: {},
          action: { color },
        },
      }),
      [color],
    );
    return (
      <CardSection {...props} className={cls("section", "actions", className)}>
        <Provider
          values={[
            [ToolbarContext, toolbarContextValue],
            [ButtonContext, buttonContextValue],
          ]}
        >
          <MergeProvider
            context={AriaButtonContext}
            value={ariaButtonContextValue}
          >
            {children}
          </MergeProvider>
        </Provider>
      </CardSection>
    );
  },
);
