import type { RefObject } from "react";
import { useEffect } from "react";
import { useDevDebugValue } from "./use-dev-debug-value";
import { useShallowStableValue } from "./use-shallow-stable";

export type EventTypes<T> = {
  [K in keyof T]: K extends `on${infer EventName}` ? EventName : never;
}[keyof T];

export type EventForType<
  T,
  EventType extends EventTypes<T>,
> = EventType extends EventType // force distribution over union, to avoid intersection
  ? T extends Record<`on${EventType}`, ((event: infer E) => unknown) | null>
    ? E
    : never
  : never;

export interface UseEventListenerConfig
  extends Omit<AddEventListenerOptions, "signal"> {
  /** Whether the event listener should be disabled. */
  disabled?: boolean;
}

/**
 * A hook to add an event listener to a given element.
 * @param ref A React ref object or a DOM element.
 * @param type The name of the event to listen for.
 * @param callback The callback to call when the event is triggered.
 * @param config The configuration object.
 */
export function useEventListener<
  T extends EventTarget,
  EventName extends EventTypes<T>,
>(
  target: RefObject<T> | T | (() => T),
  type: EventName,
  callback: (event: EventForType<T, EventName>) => void,
  config: UseEventListenerConfig = {},
) {
  const stableConfig = useShallowStableValue(config);
  useEffect(() => {
    const { disabled, ...rest } = stableConfig;
    const el =
      typeof target === "function"
        ? target()
        : "current" in target
          ? target.current
          : target;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (disabled || !el) return;
    const ac = new AbortController();
    el.addEventListener(type, callback as never, {
      signal: ac.signal,
      ...rest,
    });
    return () => {
      ac.abort();
    };
  }, [target, type, callback, stableConfig]);
  useDevDebugValue({ target, type });
}
