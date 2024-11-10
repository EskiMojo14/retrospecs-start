import { useDebugValue } from "react";

export const useDevDebugValue: typeof useDebugValue =
  process.env.NODE_ENV === "development" ? useDebugValue : () => {};
