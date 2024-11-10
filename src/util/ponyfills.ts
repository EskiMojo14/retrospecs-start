/* eslint-disable @typescript-eslint/no-non-null-assertion */
declare global {
  interface PromiseWithResolvers<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
  }
  interface PromiseConstructor {
    // https://github.com/tc39/proposal-await-dictionary
    fromEntries?<V>(
      entries: Iterable<readonly [string, V]>,
    ): Promise<Record<string, Awaited<V>>>;
    ownProperties?<T extends Record<string, unknown>>(
      obj: T,
    ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;

    // https://github.com/tc39/proposal-promise-with-resolvers
    withResolvers?<T>(): PromiseWithResolvers<T>;
  }
  interface WeakMapEmplaceHandler<K extends object, V> {
    /**
     * Will be called to get value, if no value is currently in map.
     */
    insert?(key: K, map: WeakMap<K, V>): V;
    /**
     * Will be called to update a value, if one exists already.
     */
    update?(previous: V, key: K, map: WeakMap<K, V>): V;
  }
  interface WeakMap<K extends object, V> {
    // https://github.com/tc39/proposal-upsert
    emplace?(key: K, handler: WeakMapEmplaceHandler<K, V>): V;
  }
  interface MapEmplaceHandler<K, V> {
    /**
     * Will be called to get value, if no value is currently in map.
     */
    insert?(key: K, map: Map<K, V>): V;
    /**
     * Will be called to update a value, if one exists already.
     */
    update?(previous: V, key: K, map: Map<K, V>): V;
  }
  interface Map<K, V> {
    // https://github.com/tc39/proposal-upsert
    emplace?(key: K, handler: MapEmplaceHandler<K, V>): V;
  }
  interface ObjectConstructor {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy
    groupBy?<T, K extends PropertyKey>(
      iterable: Iterable<T>,
      callbackFn: (value: T, index: number) => K,
    ): Record<K, Array<T>>;
  }
  interface MapConstructor {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy
    groupBy?<T, K>(
      iterable: Iterable<T>,
      callbackFn: (value: T, index: number) => K,
    ): Map<K, Array<T>>;
  }
}

async function promiseFromEntriesPonyfill<V>(
  entries: Iterable<readonly [string, V]>,
): Promise<Record<string, Awaited<V>>> {
  return Object.fromEntries(
    await Promise.all(
      Array.from(entries).map(
        // eslint-disable-next-line @typescript-eslint/await-thenable
        async ([key, value]) => [key, await value] as const,
      ),
    ),
  );
}

export const promiseFromEntries =
  Promise.fromEntries?.bind(Promise) ?? promiseFromEntriesPonyfill;

function promiseOwnPropertiesPonyfill<T extends Record<string, unknown>>(
  obj: T,
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  return promiseFromEntries(Object.entries(obj)) as Promise<{
    [K in keyof T]: Awaited<T[K]>;
  }>;
}

export const promiseOwnProperties =
  Promise.ownProperties?.bind(Promise) ?? promiseOwnPropertiesPonyfill;

function promiseWithResolversPonyfill<T>(): PromiseWithResolvers<T> {
  let resolve: PromiseWithResolvers<T>["resolve"];
  let reject: PromiseWithResolvers<T>["reject"];
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

export const promiseWithResolvers =
  Promise.withResolvers?.bind(Promise) ?? promiseWithResolversPonyfill;

function emplacePonyfill<K, V>(
  map: Map<K, V>,
  key: K,
  handler: MapEmplaceHandler<K, V>,
): V;
function emplacePonyfill<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  handler: WeakMapEmplaceHandler<K, V>,
): V;
function emplacePonyfill<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  handler: WeakMapEmplaceHandler<K, V>,
): V {
  if (map.has(key)) {
    let value = map.get(key) as V;
    if (handler.update) {
      map.set(key, (value = handler.update(value, key, map)));
    }
    return value;
  }
  if (!handler.insert)
    throw new Error("No insert provided for key not already in map");
  let inserted;
  map.set(key, (inserted = handler.insert(key, map)));
  return inserted;
}

export function mapEmplace<K, V>(
  map: Map<K, V>,
  key: K,
  handler: MapEmplaceHandler<K, V>,
): V;
export function mapEmplace<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  handler: WeakMapEmplaceHandler<K, V>,
): V;
export function mapEmplace<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  handler: WeakMapEmplaceHandler<K, V>,
): V {
  return map.emplace
    ? map.emplace(key, handler)
    : emplacePonyfill(map, key, handler);
}

function objectGroupByPonyfill<T, K extends PropertyKey>(
  iterable: Iterable<T>,
  callbackFn: (value: T, index: number) => K,
): Record<K, Array<T>> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result: Record<K, Array<T>> = Object.create(null);
  let index = 0;
  for (const value of iterable) {
    const key = callbackFn(value, index++);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(value);
  }
  return result;
}

export const objectGroupBy =
  Object.groupBy?.bind(Object) ?? objectGroupByPonyfill;

function mapGroupByPonyfill<T, K>(
  iterable: Iterable<T>,
  callbackFn: (value: T, index: number) => K,
): Map<K, Array<T>> {
  const result = new Map<K, Array<T>>();
  let index = 0;
  for (const value of iterable) {
    const key = callbackFn(value, index++);
    mapEmplace(result, key, {
      insert: () => [value],
      update: (values) => {
        values.push(value);
        return values;
      },
    });
  }
  return result;
}

export const mapGroupBy = Map.groupBy?.bind(Map) ?? mapGroupByPonyfill;
