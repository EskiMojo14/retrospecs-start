import { ToastQueue } from "@react-stately/toast";
import type { Toast } from "./constants";
import "./index.scss";

class ClampedToastQueue<T> extends ToastQueue<T> {
  add(...[toast, config]: Parameters<ToastQueue<T>["add"]>) {
    if (config?.timeout && config.timeout < 5000) {
      config.timeout = 5000;
    }

    return super.add(toast, config);
  }
}

export const toastQueue = new ClampedToastQueue<Toast>({
  maxVisibleToasts: 5,
  hasExitAnimation: true,
});
