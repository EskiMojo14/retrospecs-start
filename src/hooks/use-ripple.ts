import type { MDCRippleCapableSurface } from "@material/ripple";
import { MDCRippleFoundation, util } from "@material/ripple";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mergeRefs } from "~/util";

function useGetProps<T>(props: T) {
  const propsRef = useRef<T>(props);
  propsRef.current = props;
  return useCallback(() => propsRef.current, [propsRef]);
}

export function useRipple(config: Omit<MDCRippleCapableSurface, "root">) {
  const [rootRef, setRootRef] = useState<HTMLElement | null>(null);
  const [surfaceRef, setSurfaceRef] = useState<HTMLElement | null>(null);
  const getProps = useGetProps(config);
  const foundation = useMemo(() => {
    if (!rootRef || !surfaceRef) return;
    const foundation = new MDCRippleFoundation({
      addClass(className) {
        surfaceRef.classList.add(className);
      },
      browserSupportsCssVars: () => util.supportsCssVariables(window),
      computeBoundingRect: () => surfaceRef.getBoundingClientRect(),
      containsEventTarget: (target) => rootRef.contains(target as Node | null),
      deregisterDocumentInteractionHandler(evtType, handler) {
        document.documentElement.removeEventListener(evtType, handler);
      },
      deregisterResizeHandler(handler) {
        window.removeEventListener("resize", handler);
      },
      getWindowPageOffset: () => ({
        x: window.scrollX,
        y: window.scrollY,
      }),
      isSurfaceActive: () => rootRef.matches(":active"),
      isSurfaceDisabled: () => !!getProps().disabled,
      removeClass(className) {
        surfaceRef.classList.remove(className);
      },
      isUnbounded: () => !!getProps().unbounded,
      registerDocumentInteractionHandler(evtType, handler) {
        document.documentElement.addEventListener(evtType, handler, {
          passive: true,
        });
      },
      registerResizeHandler(handler) {
        window.addEventListener("resize", handler);
      },
      updateCssVariable(varName, value) {
        surfaceRef.style.setProperty(varName, value);
      },
      registerInteractionHandler(evtType, handler) {
        rootRef.addEventListener(evtType, handler, {
          passive: true,
        });
      },
      deregisterInteractionHandler(evtType, handler) {
        rootRef.removeEventListener(evtType, handler);
      },
    });
    return foundation;
  }, [rootRef, surfaceRef, getProps]);

  useEffect(() => {
    if (!foundation) return;
    foundation.init();

    return () => {
      foundation.destroy();
    };
  }, [foundation]);

  useEffect(() => {
    foundation?.setUnbounded(config.unbounded ?? false);
  }, [foundation, config.unbounded]);

  return {
    rootRef: mergeRefs(setRootRef, (r) => {
      if (r) foundation?.layout();
    }),
    surfaceRef: mergeRefs(setSurfaceRef, (r) => {
      if (r) foundation?.layout();
    }),
    foundation,
  };
}
