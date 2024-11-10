import { colors } from "~/theme/colors";

export const buttonVariants = [
  "text",
  "outlined",
  "filled",
  "elevated",
] as const;

export type ButtonVariant = (typeof buttonVariants)[number];

export const buttonColors = [...colors, "inherit"] as const;

export type ButtonColor = (typeof buttonColors)[number];
