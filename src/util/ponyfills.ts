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
  interface WeakMap<K extends object, V> {
    // https://github.com/tc39/proposal-upsert
    getOrInsert?(key: K, value: V): V;
    getOrInsertComputed?(key: K, compute: (key: K) => V): V;
  }
  interface Map<K, V> {
    // https://github.com/tc39/proposal-upsert
    getOrInsert?(key: K, value: V): V;
    getOrInsertComputed?(key: K, compute: (key: K) => V): V;
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

function getOrInsertPonyfill<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  value: V,
): V;
function getOrInsertPonyfill<K, V>(map: Map<K, V>, key: K, value: V): V;
function getOrInsertPonyfill<K extends object, V>(
  map: Map<K, V> | WeakMap<K, V>,
  key: K,
  value: V,
): V {
  if (map.has(key)) return map.get(key) as V;

  return map.set(key, value).get(key) as V;
}

export function mapGetOrInsert<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  value: V,
): V;
export function mapGetOrInsert<K, V>(map: Map<K, V>, key: K, value: V): V;
export function mapGetOrInsert<K extends object, V>(
  map: Map<K, V> | WeakMap<K, V>,
  key: K,
  value: V,
): V {
  return map.getOrInsert
    ? map.getOrInsert(key, value)
    : getOrInsertPonyfill(map, key, value);
}

function getOrInsertComputedPonyfill<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  compute: (key: K) => V,
): V;
function getOrInsertComputedPonyfill<K, V>(
  map: Map<K, V>,
  key: K,
  compute: (key: K) => V,
): V;
function getOrInsertComputedPonyfill<K extends object, V>(
  map: Map<K, V> | WeakMap<K, V>,
  key: K,
  compute: (key: K) => V,
): V {
  if (map.has(key)) return map.get(key) as V;

  return map.set(key, compute(key)).get(key) as V;
}

export function mapGetOrInsertComputed<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  compute: (key: K) => V,
): V;
export function mapGetOrInsertComputed<K, V>(
  map: Map<K, V>,
  key: K,
  compute: (key: K) => V,
): V;
export function mapGetOrInsertComputed<K extends object, V>(
  map: Map<K, V> | WeakMap<K, V>,
  key: K,
  compute: (key: K) => V,
): V {
  return map.getOrInsertComputed
    ? map.getOrInsertComputed(key, compute)
    : getOrInsertComputedPonyfill(map, key, compute);
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
    mapGetOrInsertComputed(result, callbackFn(value, index++), () => []).push(
      value,
    );
  }
  return result;
}

export const mapGroupBy = Map.groupBy?.bind(Map) ?? mapGroupByPonyfill;
