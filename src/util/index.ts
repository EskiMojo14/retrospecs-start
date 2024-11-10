import { mergeProps } from "@react-aria/utils";
import type { ForwardedRef, RefCallback } from "react";
import type { ContextValue } from "react-aria-components";
import BEMHelper from "react-bem-helper";
import type { KeysMatchingValue } from "./types";

export function assert(
  condition: unknown,
  message?: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export const bemHelper = BEMHelper.withDefaults({
  outputIsString: true,
});

export const safeAssign: <T extends object>(
  target: T,
  ...sources: Array<Partial<T>>
) => T = Object.assign;

export const toLowerCaseTyped = <T extends string>(value: T): Lowercase<T> =>
  value.toLowerCase() as Lowercase<T>;

export const toUpperCaseTyped = <T extends string>(value: T): Uppercase<T> =>
  value.toUpperCase() as Uppercase<T>;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

type NullishDefaults<T> = {
  [K in keyof T as T[K] extends NonNullable<T[K]> ? never : K]-?: NonNullable<
    T[K]
  >;
};

export type WithoutNullish<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

/**
 * Set default values for nullish properties in an object
 */
export function defaultNullish<T>(
  value: T,
  defaults: NullishDefaults<T>,
): WithoutNullish<T> {
  const result = { ...value };
  let changed = false;
  for (const key in defaults) {
    if (result[key] == null) {
      result[key] = defaults[key];
      changed = true;
    }
  }
  return (changed ? result : value) as never;
}

export const mergeRefs =
  <T>(...refs: Array<ForwardedRef<T> | null | undefined>): RefCallback<T> =>
  (value) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    }
  };

export function mergeSlottedContext<T, El extends HTMLElement>(
  parentValue: ContextValue<T, El>,
  value: ContextValue<T, El>,
): ContextValue<T, El> {
  if (!parentValue) {
    return value;
  }
  if (!value) {
    return parentValue;
  }
  if (!("slots" in parentValue)) {
    if (!("slots" in value)) {
      return mergeProps(parentValue, value) as never;
    }
    const slots = { ...value.slots };
    for (const slot of Reflect.ownKeys(value.slots ?? {})) {
      slots[slot] = mergeProps(parentValue, value.slots?.[slot]) as never;
    }
    return { slots };
  }
  const slots = { ...parentValue.slots };
  if (!("slots" in value)) {
    for (const slot of Reflect.ownKeys(slots)) {
      slots[slot] = mergeProps(slots[slot], value) as never;
    }
  } else {
    for (const slot of Reflect.ownKeys(value.slots ?? {})) {
      slots[slot] = mergeProps(slots[slot], value.slots?.[slot]) as never;
    }
  }
  return { slots };
}

export interface Unsubscribable {
  unsubscribe: () => void;
}

export const makeDisposable = <T extends Unsubscribable>(
  unsubscribable: T,
): T & Disposable =>
  Object.assign(unsubscribable, {
    [Symbol.dispose]() {
      unsubscribable.unsubscribe();
    },
  });

export interface AsyncUnsubscribable {
  unsubscribe: () => PromiseLike<void>;
}

export const makeAsyncDisposable = <T extends AsyncUnsubscribable>(
  unsubscribable: T,
): T & AsyncDisposable =>
  Object.assign(unsubscribable, {
    async [Symbol.asyncDispose]() {
      await unsubscribable.unsubscribe();
    },
  });

export const sortByKey = <T>(
  key: KeysMatchingValue<T, string>,
  { order, ...options }: Intl.CollatorOptions & { order?: "asc" | "desc" } = {},
) => {
  const collator = new Intl.Collator(undefined, options);
  const direction = order === "desc" ? -1 : 1;
  return (a: T, b: T) =>
    direction * collator.compare(a[key] as string, b[key] as string);
};

export const sortByName = sortByKey<{ name: string }>("name", {
  sensitivity: "base",
});

type PluraliseTuple = [count: number, singular: string, plural?: string];

const isPluralizeTuple = (value: unknown): value is PluraliseTuple =>
  Array.isArray(value) &&
  value.length >= 2 &&
  typeof value[0] === "number" &&
  typeof value[1] === "string";

export const pluralize = (
  strings: TemplateStringsArray,
  ...values: Array<unknown>
) => {
  let result = strings[0] ?? "";
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (isPluralizeTuple(value)) {
      const [count, singular, plural = `${singular}s`] = value;
      result += count === 1 ? singular : plural;
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      result += `${value}`;
    }
    result += strings[i + 1] ?? "";
  }
  return result;
};

export const repeatArray = <T>(array: Array<T>, count: number) =>
  Array<Array<T>>(count).fill(array).flat();

export const ensureNumber = (value: unknown, message?: string): number => {
  const number = Number(value);
  if (Number.isNaN(number)) {
    throw new Error(message ?? `Invalid number: ${value}`);
  }
  return number;
};
