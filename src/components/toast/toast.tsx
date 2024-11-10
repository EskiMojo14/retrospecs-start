import type { AriaToastProps } from "@react-aria/toast";
import { useToast } from "@react-aria/toast";
import type { ToastState } from "@react-stately/toast";
import type { ReactNode } from "react";
import { useMemo, useRef } from "react";
import type { ButtonProps } from "~/components/button";
import { ButtonContext } from "~/components/button";
import { IconButton } from "~/components/icon-button";
import { Symbol } from "~/components/symbol";
import { Heading, Typography } from "~/components/typography";
import { bemHelper } from "~/util";
import type { Toast } from "./constants";
import { typeColors, toastSymbols } from "./constants";

interface ToastProps extends AriaToastProps<Toast> {
  state: ToastState<Toast>;
}

const cls = bemHelper("toast");

export function Toast({ state, ...props }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { toastProps, titleProps, descriptionProps, closeButtonProps } =
    useToast(props, state, ref);
  const {
    content: {
      symbol,
      title,
      type = "default",
      description,
      actions: actionsProp,
    },
    timeout,
  } = props.toast;
  const color = typeColors[type];
  const buttonProps = useMemo<ButtonProps>(
    () => ({
      color,
    }),
    [color],
  );
  const actions = useMemo<ReactNode>(() => {
    if (!actionsProp) {
      return undefined;
    }
    if (typeof actionsProp === "function") {
      return actionsProp({
        close: () => {
          state.close(props.toast.key);
        },
      });
    }
    return actionsProp;
  }, [actionsProp, props.toast.key, state]);
  return (
    <div
      {...toastProps}
      ref={ref}
      className={cls({
        modifiers: {
          [type]: true,
          "has-timeout": !!timeout,
        },
        extra: "color-" + color,
      })}
      style={{
        "--timeout": timeout && `${timeout}ms`,
      }}
      data-animation={props.toast.animation}
      onAnimationEnd={(e) => {
        if (e.animationName.startsWith("toast-slide-out")) {
          state.remove(props.toast.key);
        }
      }}
    >
      <ButtonContext.Provider value={buttonProps}>
        <div className={cls("icon")}>
          {symbol ?? <Symbol>{toastSymbols[type]}</Symbol>}
        </div>
        <div className={cls("content")}>
          {title && (
            <Heading
              variant="subtitle1"
              className={cls("title")}
              {...titleProps}
            >
              {title}
            </Heading>
          )}
          {description && (
            <Typography
              variant="body2"
              className={cls("description")}
              {...descriptionProps}
            >
              {description}
            </Typography>
          )}
        </div>
        {actions ?? (
          <IconButton
            {...closeButtonProps}
            className={cls("close")}
            tooltip="Close toast"
          >
            <Symbol>close</Symbol>
          </IconButton>
        )}
        {timeout && (
          <div className={cls("progress")}>
            <div className={cls("progress-stop")} />
          </div>
        )}
      </ButtonContext.Provider>
    </div>
  );
}
