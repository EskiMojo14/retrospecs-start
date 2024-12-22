import throttle from "lodash/throttle";
import type { RefObject } from "react";
import { useMemo, useRef } from "react";
import type { Compute, OneOf } from "~/util/types";
import type { UseEventListenerConfig } from "./use-event-listener";
import { useEventListener } from "./use-event-listener";

interface UseScrollDirectionConfig extends UseEventListenerConfig {
  /** The throttle time in milliseconds. Defaults to 500. */
  throttleMs?: number;
}

type ScrollTarget = Compute<
  EventTarget & {
    onscroll: ((this: GlobalEventHandlers, ev: Event) => void) | null;
  } & OneOf<{ scrollY: number } | { scrollTop: number }>
>;

export function useScrollDirection(
  target: RefObject<ScrollTarget | null> | ScrollTarget | (() => ScrollTarget),
  onScroll: (direction: "up" | "down") => void,
  config: UseScrollDirectionConfig = {},
) {
  const lastScrollTop = useRef(0);
  const lastScrollDirection = useRef<"up" | "down">("down");

  useEventListener(
    target,
    "scroll",
    useMemo(
      () =>
        throttle(() => {
          const el =
            typeof target === "function"
              ? target()
              : "current" in target
                ? target.current
                : target;
          if (!el) return;

          const scrollTop = el.scrollY ?? el.scrollTop;
          const scrollDirection =
            scrollTop > lastScrollTop.current ? "down" : "up";
          if (scrollDirection !== lastScrollDirection.current) {
            onScroll(scrollDirection);
            lastScrollDirection.current = scrollDirection;
          }

          lastScrollTop.current = scrollTop;
        }, config.throttleMs ?? 500),
      [onScroll, target, config.throttleMs],
    ),
    config,
  );
}
