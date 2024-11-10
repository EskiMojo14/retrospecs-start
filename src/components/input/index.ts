import upperFirst from "lodash/upperFirst";
import { useMemo, useRef } from "react";
import { bemHelper } from "~/util";
import type { Compute, UnionToIntersection } from "~/util/types";

export const inputGroupCls = bemHelper("input-group");

export type EventMap = Record<string, Record<string, boolean>>;

export type EventHandlers<T extends EventMap> = Compute<
  UnionToIntersection<
    T[keyof T] extends infer E
      ? {
          [K in keyof E as `on${Capitalize<K & string>}`]: () => void;
        }
      : never
  >
>;

export function useLiftInputState<T extends EventMap>(map: T) {
  const containerRef = useRef<HTMLLabelElement>(null);
  const inputEventProps = useMemo(() => {
    const setContainerState = (state: string, value: boolean) => () => {
      if (!containerRef.current) return;
      if (value) {
        containerRef.current.dataset[state] = String(value);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete containerRef.current.dataset[state];
      }
    };
    return Object.fromEntries(
      Object.entries(map).flatMap(([state, events]) =>
        Object.entries(events).map(([event, value]) => [
          `on${upperFirst(event)}`,
          setContainerState(state, value),
        ]),
      ),
    ) as EventHandlers<T>;
  }, [map]);
  return { containerRef, inputEventProps };
}
