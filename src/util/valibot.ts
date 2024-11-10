import { number, pipe, string, transform, union } from "valibot";

export const coerceNumber = (message?: string) =>
  union(
    [
      number(),
      pipe(
        string(),
        transform((v) => Number(v)),
        number(), // avoid NaN
      ),
    ],
    message,
  );
