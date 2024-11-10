export const getUrl = async () =>
  typeof window === "undefined"
    ? await import("vinxi/http").then(({ getRequestURL }) => getRequestURL())
    : new URL(window.location.href);
