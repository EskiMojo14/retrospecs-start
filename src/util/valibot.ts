import { number, object, pipe, string, transform, union } from "valibot";

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

export const numberParamsSchema = <const K extends string>(...keys: Array<K>) =>
  object(
    Object.fromEntries(
      keys.map((key) => [key, coerceNumber(`Invalid number: ${key}`)]),
    ) as Record<K, ReturnType<typeof coerceNumber>>,
  );
