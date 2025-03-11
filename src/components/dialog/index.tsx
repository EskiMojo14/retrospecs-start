import { clsx } from "clsx";
import type { ContextType, ReactNode } from "react";
import type {
  DialogProps as AriaDialogProps,
  DialogTriggerProps,
  ModalOverlayProps,
} from "react-aria-components";
import {
  Dialog as AriaDialog,
  DialogTrigger,
  DEFAULT_SLOT,
  Modal,
  ModalOverlay,
  composeRenderProps,
} from "react-aria-components";
import { createGenericComponent } from "~/components/generic";
import { LineBackground } from "~/components/line-background";
import { ToolbarContext } from "~/components/toolbar";
import { bemHelper } from "~/util";
import "./index.scss";

export interface DialogProps
  extends AriaDialogProps,
    Pick<
      ModalOverlayProps,
      | "isDismissable"
      | "isKeyboardDismissDisabled"
      | "shouldCloseOnInteractOutside"
    > {
  modalProps?: ModalOverlayProps & { className?: string };
  modalOverlayProps?: ModalOverlayProps & { className?: string };
  trigger: ReactNode;
  triggerProps?: Omit<DialogTriggerProps, "children">;
}

const cls = bemHelper("dialog");
const overlayCls = bemHelper("dialog-overlay");

const toolbarContextValue: ContextType<typeof ToolbarContext> = {
  slots: {
    [DEFAULT_SLOT]: {},
    actions: { align: "end" },
  },
};

export const Dialog = ({
  className,
  modalOverlayProps,
  modalProps,
  isDismissable,
  isKeyboardDismissDisabled,
  shouldCloseOnInteractOutside,
  children,
  trigger,
  triggerProps,
  ...props
}: DialogProps) => (
  <DialogTrigger {...triggerProps}>
    {trigger}
    <ModalOverlay
      {...{
        isDismissable,
        isKeyboardDismissDisabled,
        shouldCloseOnInteractOutside,
      }}
      {...modalOverlayProps}
      className={overlayCls({ extra: modalOverlayProps?.className ?? "" })}
    >
      <Modal
        {...modalProps}
        className={clsx("dialog-modal", modalProps?.className)}
      >
        <LineBackground opacity={0.3}>
          <AriaDialog {...props} className={cls({ extra: className })}>
            {composeRenderProps(children, (children) => (
              <ToolbarContext value={toolbarContextValue}>
                {children}
              </ToolbarContext>
            ))}
          </AriaDialog>
        </LineBackground>
      </Modal>
    </ModalOverlay>
  </DialogTrigger>
);

export const DialogContent = createGenericComponent<
  "div",
  { className?: string },
  { className: string }
>("DialogContent", "div", ({ as: As, className, ...props }) => (
  <As {...props} className={cls("content", undefined, className)} />
));
