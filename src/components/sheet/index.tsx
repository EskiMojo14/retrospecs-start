import type { ContextType, ReactNode } from "react";
import type {
  DialogProps as AriaDialogProps,
  DialogTriggerProps,
  ModalOverlayProps,
} from "react-aria-components";
import {
  DEFAULT_SLOT,
  Dialog,
  DialogTrigger,
  HeaderContext,
  HeadingContext,
  ModalOverlay,
  Modal,
  composeRenderProps,
} from "react-aria-components";
import { createGenericComponent } from "~/components/generic";
import { LineBackground } from "~/components/line-background";
import { MergeProvider, Provider } from "~/components/provider";
import { ToolbarContext } from "~/components/toolbar";
import { bemHelper } from "~/util";
import "./index.scss";

export interface ModalSideSheetProps
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
  /** @default "end" */
  attach?: "start" | "end";
}

const cls = bemHelper("sheet");
const overlayCls = bemHelper("sheet-overlay");

const toolbarContextValue: ContextType<typeof ToolbarContext> = {
  slots: {
    [DEFAULT_SLOT]: {},
    actions: { align: "start", className: cls("actions") },
  },
};

const headerContextValue: ContextType<typeof HeaderContext> = {
  slots: {
    [DEFAULT_SLOT]: {},
    title: {
      className: cls("title-container"),
    },
  },
};

const headingContextValue: ContextType<typeof HeadingContext> = {
  slots: {
    title: {
      className: cls("title"),
    },
  },
};

export const ModalSideSheet = ({
  className,
  modalOverlayProps,
  modalProps,
  isDismissable,
  isKeyboardDismissDisabled,
  shouldCloseOnInteractOutside,
  children,
  trigger,
  triggerProps,
  attach = "end",
  ...props
}: ModalSideSheetProps) => (
  <DialogTrigger {...triggerProps}>
    {trigger}
    <ModalOverlay
      {...{
        isDismissable,
        isKeyboardDismissDisabled,
        shouldCloseOnInteractOutside,
      }}
      {...modalOverlayProps}
      className={overlayCls({ extra: modalOverlayProps?.className })}
    >
      <Modal
        {...modalProps}
        className={cls({
          modifiers: ["modal", `attach-${attach}`],
          extra: modalProps?.className,
        })}
      >
        <LineBackground opacity={0.3}>
          <Dialog
            {...props}
            className={cls({
              element: "dialog",
              extra: className,
            })}
          >
            {composeRenderProps(children, (children) => (
              <Provider
                values={[
                  [ToolbarContext, toolbarContextValue],
                  [HeaderContext, headerContextValue],
                ]}
              >
                <MergeProvider
                  context={HeadingContext}
                  value={headingContextValue}
                >
                  {children}
                </MergeProvider>
              </Provider>
            ))}
          </Dialog>
        </LineBackground>
      </Modal>
    </ModalOverlay>
  </DialogTrigger>
);

export const SheetContent = createGenericComponent<
  "section",
  { className?: string },
  { className: string }
>("SheetContent", "section", ({ as: As, className, ...props }, ref) => (
  <As
    {...props}
    ref={ref}
    className={cls({ element: "content", extra: className })}
  />
));
