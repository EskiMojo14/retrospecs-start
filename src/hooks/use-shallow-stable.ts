import { useEffect, useRef } from "react";
import { shallowEqual } from "react-redux";
import { useDevDebugValue } from "./use-dev-debug-value";

export function useShallowStableValue<T>(value: T) {
  const cache = useRef(value);
  useEffect(() => {
    if (!shallowEqual(cache.current, value)) {
      cache.current = value;
    }
  }, [value]);

  useDevDebugValue(value);

  return shallowEqual(cache.current, value) ? cache.current : value;
}
