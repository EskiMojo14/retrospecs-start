import type {
  EventTypes,
  EventForType,
  EventTargetLike,
  HandlerMap,
} from "rad-event-listeners";
import { radEventListeners } from "rad-event-listeners";
import type { RefObject } from "react";
import { useEffect } from "react";
import { useDevDebugValue } from "./use-dev-debug-value";
import { useShallowStableValue } from "./use-shallow-stable";

export interface UseEventListenerConfig extends AddEventListenerOptions {
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
  T extends EventTargetLike,
  EventName extends EventTypes<T>,
>(
  target: RefObject<T | null> | T | (() => T),
  type: EventName,
  callback: (event: EventForType<T, EventName>) => void,
  config: UseEventListenerConfig = {},
) {
  useEventListeners(
    target,
    { [type]: callback } as Record<EventName, typeof callback>,
    config,
  );
}

export function useEventListeners<
  T extends EventTargetLike,
  EventName extends EventTypes<T>,
>(
  target: RefObject<T | null> | T | (() => T),
  handlers: HandlerMap<T, EventName>,
  globalConfig: UseEventListenerConfig = {},
) {
  const stableHandlers = useShallowStableValue(handlers);
  const stableConfig = useShallowStableValue(globalConfig);
  useEffect(() => {
    const el =
      typeof target === "function"
        ? target()
        : "current" in target
          ? target.current
          : target;

    if (stableConfig.disabled || !el) return;
    return radEventListeners(el, stableHandlers, stableConfig);
  }, [target, stableHandlers, stableConfig]);
  useDevDebugValue({ target, handlers });
}
