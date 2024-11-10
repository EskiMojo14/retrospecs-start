import type { ReactNode } from "react";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import type { ButtonProps, LoadingButtonProps } from "~/components/button";
import { Button, LoadingButton } from "~/components/button";
import { Toolbar } from "~/components/toolbar";
import { Heading, Typography } from "~/components/typography";
import type { Overwrite } from "~/util/types";
import type { DialogProps } from ".";
import { Dialog, DialogContent } from ".";

export interface ConfirmationDialogProps extends Omit<DialogProps, "children"> {
  title: ReactNode;
  description: ReactNode;
  onConfirm: (close: () => void) => void;
  onCancel?: () => void;
  confirmButtonProps: Omit<
    Overwrite<Overwrite<AriaButtonProps, ButtonProps>, LoadingButtonProps>,
    "onPress"
  >;
  cancelButtonProps?: Omit<Overwrite<AriaButtonProps, ButtonProps>, "onPress">;
  children?: ReactNode;
}

export function ConfirmationDialog({
  title,
  description,
  onConfirm,
  onCancel,
  confirmButtonProps,
  cancelButtonProps,
  children,
  ...props
}: ConfirmationDialogProps) {
  return (
    <Dialog {...props}>
      {({ close }) => (
        <>
          <Heading variant="headline6" slot="title">
            {title}
          </Heading>
          <DialogContent>
            {children ?? <Typography variant="body2">{description}</Typography>}
          </DialogContent>
          <Toolbar slot="actions">
            <Button
              variant="outlined"
              {...cancelButtonProps}
              onPress={() => {
                onCancel?.();
                close();
              }}
            >
              {cancelButtonProps?.children ?? "Cancel"}
            </Button>
            <LoadingButton
              variant="elevated"
              {...confirmButtonProps}
              onPress={() => {
                onConfirm(close);
              }}
            >
              {confirmButtonProps.children ?? "Confirm"}
            </LoadingButton>
          </Toolbar>
        </>
      )}
    </Dialog>
  );
}
