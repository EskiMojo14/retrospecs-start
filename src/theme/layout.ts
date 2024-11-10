export const breakpoints = [
  "phone",
  "tablet-s",
  "tablet-l",
  "laptop",
  "desktop",
] as const;

export type Breakpoint = (typeof breakpoints)[number];
