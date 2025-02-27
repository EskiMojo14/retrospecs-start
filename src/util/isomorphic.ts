import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestURL } from "vinxi/http";

export const getUrl = createIsomorphicFn()
  .server(getRequestURL)
  .client(() => new URL(window.location.href));
