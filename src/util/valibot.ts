import type {
  ErrorMessage,
  GenericSchema,
  GenericSchemaAsync,
  NumberIssue,
  StringIssue,
  UnionIssue,
} from "valibot";
import {
  _stringify,
  number,
  object,
  pipe,
  string,
  transform,
  union,
} from "valibot";

/**
 * Creates an object entries definition from a list of keys and a schema.
 *
 * @param list A list of keys.
 * @param schema The schema of the keys, or a factory function that receives a key and returns the schema.
 *
 * @returns The object entries.
 */
export function entriesFromList<
  const List extends ReadonlyArray<PropertyKey>,
  const Schema extends GenericSchema | GenericSchemaAsync,
>(
  list: List,
  schema: Schema | ((key: List[number]) => Schema),
): Record<List[number], Schema> {
  const entries: Record<List[number], Schema> = {} as never;
  for (const key of list) {
    entries[key as List[number]] =
      typeof schema === "function" ? schema(key) : schema;
  }
  return entries;
}

export const coerceNumber = (
  message?: ErrorMessage<UnionIssue<StringIssue | NumberIssue>>,
) =>
  union(
    [
      number(),
      pipe(
        string(),
        transform(Number),
        number(), // avoid NaN
      ),
    ],
    message,
  );

export const numberParamsSchema = <const Key extends string>(
  ...keys: Array<Key>
) =>
  object(
    entriesFromList(keys, (key) =>
      coerceNumber(
        (issue) =>
          `Invalid number provided for "${key}", received: ${_stringify(issue.input)}`,
      ),
    ),
  );
