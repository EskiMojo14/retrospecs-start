import type { Enums } from "~/db/supabase";

export type Color = Enums<"color">;

export const colors = [
  "pink",
  "red",
  "orange",
  "amber",
  "gold",
  "green",
  "teal",
  "blue",
] as const satisfies Array<Color>;
