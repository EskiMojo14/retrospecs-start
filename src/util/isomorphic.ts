import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestURL } from "@tanstack/react-start/server";

export const getUrl = createIsomorphicFn()
  .server(getRequestURL)
  .client(() => new URL(window.location.href));
