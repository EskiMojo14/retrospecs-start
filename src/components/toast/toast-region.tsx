import type { AriaToastRegionProps } from "@react-aria/toast";
import { useToastRegion } from "@react-aria/toast";
import type { ToastState } from "@react-stately/toast";
import { useToastQueue } from "@react-stately/toast";
import { useRef } from "react";
import { createPortal } from "react-dom";
import type { Toast } from "./constants";
import { Toast as ToastComp } from "./toast";
import { toastQueue } from ".";

interface ToastRegionProps extends AriaToastRegionProps {
  state: ToastState<Toast>;
}

export function ToastRegion({ state, ...props }: ToastRegionProps) {
  const ref = useRef(null);
  const { regionProps } = useToastRegion(props, state, ref);

  return (
    <div {...regionProps} ref={ref} className="toast-region">
      {state.visibleToasts.map((toast) => (
        <ToastComp key={toast.key} toast={toast} state={state} />
      ))}
    </div>
  );
}

export function GlobalToastRegion(props: Omit<ToastRegionProps, "state">) {
  const state = useToastQueue(toastQueue);

  return state.visibleToasts.length > 0 && typeof document !== "undefined" ? (
    <>{createPortal(<ToastRegion {...props} state={state} />, document.body)}</>
  ) : null;
}
