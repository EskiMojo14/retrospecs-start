import type { CollectionProps } from "@react-aria/collections";
import { mergeProps } from "@react-aria/utils";
import type { ReactNode, RefAttributes, RefCallback } from "react";
import { createContext, useCallback, useMemo, useRef } from "react";
import type {
  ToggleButtonProps as AriaToggleButtonProps,
  ContextValue,
  SlotProps,
} from "react-aria-components";
import {
  Button as AriaButton,
  ToggleButton as AriaToggleButton,
  Collection,
  DEFAULT_SLOT,
  FieldError,
  Group,
  Label,
  Link,
  Text,
  useContextProps,
} from "react-aria-components";
import {
  createGenericComponent,
  renderGenericPropChild,
  withNewDefault,
} from "~/components/generic";
import type { FormGroupProps } from "~/components/input/text-field";
import type { ProgressProps } from "~/components/progress";
import { CassetteProgress, CircularProgress } from "~/components/progress";
import { MergeProvider } from "~/components/provider";
import type { SymbolProps } from "~/components/symbol";
import { SymbolContext } from "~/components/symbol";
import { Toolbar } from "~/components/toolbar";
import { Typography } from "~/components/typography";
import { useEventListener } from "~/hooks/use-event-listener";
import { useRipple } from "~/hooks/use-ripple";
import { bemHelper, mergeRefs } from "~/util";
import type { Overwrite } from "~/util/types";
import type { ButtonColor, ButtonVariant } from "./constants";
import "./index.scss";

export interface ButtonProps extends SlotProps {
  variant?: ButtonVariant;
  className?: string;
  color?: ButtonColor;
  isDisabled?: boolean;
  unbounded?: boolean;
}

const cls = bemHelper("button");

const sharedIconProps: SymbolProps = {
  size: 20,
};

const buttonSymbolSlots = {
  slots: {
    [DEFAULT_SLOT]: {},
    leading: { ...sharedIconProps, className: cls("icon", "leading") },
    trailing: { ...sharedIconProps, className: cls("icon", "trailing") },
  },
};

export const ButtonContext =
  createContext<ContextValue<ButtonProps, HTMLElement>>(null);

export const Button = createGenericComponent<
  typeof AriaButton,
  ButtonProps,
  {
    className: string;
    children: ReactNode;
    ref: RefCallback<HTMLElement>;
  }
>("Button", AriaButton, (props, ref) => {
  let unbounded;
  [{ unbounded, ...props }, ref] = useContextProps(
    props,
    ref as never,
    ButtonContext,
  ) as [typeof props, typeof ref];
  const { surfaceRef, rootRef } = useRipple({
    disabled: props.isDisabled,
    unbounded,
  });
  const {
    variant = "text",
    color = "gold",
    className,
    as: As,
    ...rest
  } = props;
  return (
    <As
      {...rest}
      ref={mergeRefs(ref, rootRef as never)}
      className={cls({
        modifiers: {
          [variant]: true,
        },
        extra: [className ?? "", "color-" + color],
      })}
    >
      {renderGenericPropChild(rest, (children) => (
        <MergeProvider context={SymbolContext} value={buttonSymbolSlots}>
          <div
            className={cls("ripple", { unbounded: !!unbounded })}
            ref={surfaceRef}
          />
          <div className={cls("content")}>{children}</div>
        </MergeProvider>
      ))}
    </As>
  );
});

export const LinkButton = withNewDefault("LinkButton", Button, Link);

export type ToggleButtonProps = Overwrite<AriaToggleButtonProps, ButtonProps>;

export const ToggleButton = ({
  ref,
  ...props
}: ToggleButtonProps & RefAttributes<HTMLButtonElement>) => {
  const innerRef = useRef<HTMLButtonElement>(null);
  useEventListener(
    innerRef,
    "mouseleave",
    useCallback(() => {
      innerRef.current?.classList.remove("toggle-button--changed");
    }, []),
  );
  return (
    <Button
      as={AriaToggleButton}
      {...mergeProps(props, {
        ref: mergeRefs(ref, innerRef),
        onChange(isSelected: boolean) {
          if (isSelected) {
            innerRef.current?.classList.add("toggle-button--changed");
          }
        },
      })}
    />
  );
};

export interface ButtonGroupProps<T extends object>
  extends Pick<ButtonProps, "color" | "variant" | "isDisabled">,
    FormGroupProps,
    Pick<CollectionProps<T>, "items" | "children" | "dependencies"> {
  orientation?: "horizontal" | "vertical";
  className?: string;
  id: string;
}

const clsGroup = bemHelper("button-group");

export const ButtonGroup = <T extends object>({
  className,
  children,
  id,

  isDisabled,
  color,
  variant,

  orientation = "horizontal",
  label,
  labelProps,
  description,
  descriptionProps,
  errorMessage,
  errorMessageProps,

  items,
  dependencies,

  ...props
}: ButtonGroupProps<T>) => {
  const contextValue = useMemo<ButtonProps>(
    () => ({ color, isDisabled, variant }),
    [color, isDisabled, variant],
  );

  return (
    <Group
      {...props}
      className={clsGroup({
        extra: className,
      })}
      id={id}
      data-orientation={orientation}
    >
      <Typography
        as={Label}
        variant="subtitle2"
        id={`${id}-label`}
        {...labelProps}
        className={clsGroup({
          element: "label",
          extra: labelProps?.className,
        })}
      >
        {label}
      </Typography>
      <ButtonContext.Provider value={contextValue}>
        <Toolbar
          className={clsGroup("buttons")}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={description ? `${id}-description` : undefined}
        >
          <Collection
            {...{
              items,
              dependencies,
            }}
            idScope={id}
          >
            {children}
          </Collection>
        </Toolbar>
      </ButtonContext.Provider>
      {description && (
        <Typography
          as={Text}
          slot="description"
          variant="caption"
          id={`${id}-description`}
          {...descriptionProps}
          className={clsGroup({
            element: "description",
            extra: descriptionProps?.className,
          })}
        >
          {description}
        </Typography>
      )}
      <Typography as={FieldError} variant="caption" {...errorMessageProps}>
        {errorMessage}
      </Typography>
    </Group>
  );
};

export interface LoadingButtonProps
  extends Pick<ProgressProps, "isIndeterminate"> {
  progressLabel?: string;
  loadingValue?: number;
  isDisabled?: boolean;
  className?: string;
  progressVariant?: "cassette" | "circular";
}

export const LoadingButton = createGenericComponent<
  typeof Button,
  LoadingButtonProps,
  { children: ReactNode; className: string; isDisabled?: boolean }
>(
  "LoadingButton",
  Button,
  (
    {
      isIndeterminate,
      loadingValue,
      isDisabled,
      as: As,
      className,
      progressLabel,
      progressVariant = "cassette",
      ...props
    },
    ref,
  ) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const isLoading = isIndeterminate || loadingValue !== undefined;
    const Progress =
      progressVariant === "circular" ? CircularProgress : CassetteProgress;
    return (
      <As
        {...props}
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        isDisabled={isDisabled || isLoading}
        ref={ref}
        className={cls({
          modifiers: {
            loading: isLoading,
          },
          extra: className,
        })}
      >
        {renderGenericPropChild(props, (children) =>
          isLoading ? (
            <Progress
              value={loadingValue}
              aria-label={progressLabel}
              {...{ isIndeterminate }}
            />
          ) : (
            children
          ),
        )}
      </As>
    );
  },
);
