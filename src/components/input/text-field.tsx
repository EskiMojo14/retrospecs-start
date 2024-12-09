import type { ContextType, ReactNode, RefAttributes } from "react";
import { useMemo } from "react";
import type {
  TextFieldProps as AriaTextFieldProps,
  FieldErrorProps,
  TextProps,
  ValidationResult,
  LabelProps,
  PressEvent,
} from "react-aria-components";
import {
  TextField as AriaTextField,
  FieldError,
  Input,
  Label,
  Text,
  TextArea,
} from "react-aria-components";
import { ButtonContext } from "~/components/button";
import { Provider } from "~/components/provider";
import { SymbolContext } from "~/components/symbol";
import type { TypographyProps } from "~/components/typography";
import { Typography } from "~/components/typography";
import type { Color } from "~/theme/colors";
import { bemHelper } from "~/util";
import type { Overwrite } from "~/util/types";
import type { EventMap } from ".";
import { inputGroupCls, useLiftInputState } from ".";
import "./index.scss";

export interface FormGroupProps {
  label?: ReactNode;
  labelProps?: Overwrite<LabelProps, Partial<TypographyProps>>;
  description?: ReactNode;
  descriptionProps?: Overwrite<TextProps, Partial<TypographyProps>>;
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  errorMessageProps?: Overwrite<FieldErrorProps, Partial<TypographyProps>>;
}

export interface TextFieldProps
  extends Omit<AriaTextFieldProps, "children" | "className">,
    FormGroupProps {
  placeholder?: string;
  className?: string;
  textarea?: boolean;
  color?: Color;
  icon?: ReactNode;
  action?: ReactNode;
  onAction?: (event: PressEvent) => void;
}

const cls = bemHelper("text-field");

const symbolContextValue: ContextType<typeof SymbolContext> = {
  className: inputGroupCls("icon"),
};

const textFieldEvents = {
  hovered: { hoverStart: true, hoverEnd: false },
  focused: { focus: true, blur: false },
} satisfies EventMap;

export const TextField = ({
  className,
  label,
  labelProps,
  description,
  descriptionProps,
  errorMessage,
  errorMessageProps,
  textarea,
  icon,
  action,
  onAction,
  color = "gold",
  ref,
  ...props
}: TextFieldProps & RefAttributes<HTMLInputElement & HTMLTextAreaElement>) => {
  const { containerRef, inputEventProps } = useLiftInputState(textFieldEvents);
  const buttonContextValue = useMemo<ContextType<typeof ButtonContext>>(
    () => ({
      slots: {
        action: {
          className: cls("action"),
          onPress: onAction,
        },
      },
    }),
    [onAction],
  );
  return (
    <AriaTextField
      {...props}
      className={inputGroupCls({
        extra: cls({ extra: [className ?? "", "color-" + color] }),
      })}
    >
      <Typography
        as={Label}
        variant="subtitle2"
        {...labelProps}
        className={inputGroupCls({
          element: "label",
          extra: labelProps?.className,
        })}
      >
        {label}
      </Typography>
      <label ref={containerRef} className={inputGroupCls("input-container")}>
        <Provider
          values={[
            [SymbolContext, symbolContextValue],
            [ButtonContext, buttonContextValue],
          ]}
        >
          {icon}
          {textarea ? (
            <TextArea
              ref={ref}
              className={cls("textarea")}
              {...inputEventProps}
            />
          ) : (
            <Input ref={ref} className={cls("input")} {...inputEventProps} />
          )}
          {action}
        </Provider>
      </label>
      {!!description && (
        <Typography
          as={Text}
          variant="caption"
          slot="description"
          {...descriptionProps}
          className={inputGroupCls({
            element: "description",
            extra: descriptionProps?.className,
          })}
        >
          {description}
        </Typography>
      )}
      <Typography
        as={FieldError}
        variant="body2"
        {...errorMessageProps}
        className={inputGroupCls({
          element: "error-message",
          extra: errorMessageProps?.className,
        })}
      >
        {errorMessage}
      </Typography>
    </AriaTextField>
  );
};
