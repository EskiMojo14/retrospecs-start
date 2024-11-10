import type { ReactNode } from "react";
import type { Color } from "~/theme/colors";
import type { AtLeastOneKey } from "~/util/types";

export const toastTypes = [
  "success",
  "info",
  "warning",
  "error",
  "default",
] as const;

export type ToastType = (typeof toastTypes)[number];

export interface ToastActionsRenderProps {
  close: () => void;
}

export type Toast = AtLeastOneKey<{
  title?: ReactNode;
  description?: ReactNode;
}> & {
  type?: ToastType;
  symbol?: ReactNode;
  actions?: ReactNode | ((props: ToastActionsRenderProps) => ReactNode);
};

export const toastSymbols: Record<ToastType, string> = {
  success: "check_circle",
  info: "info",
  warning: "warning",
  error: "error",
  default: "campaign",
};

export const typeColors: Record<ToastType, Color> = {
  success: "green",
  info: "blue",
  warning: "orange",
  error: "red",
  default: "gold",
};
