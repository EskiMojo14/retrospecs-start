/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, it, vi } from "vitest";
import type * as Ponyfills from "./ponyfills";
import {
  mapGetOrInsert,
  mapGetOrInsertComputed,
  mapGroupBy,
  objectGroupBy,
  promiseFromEntries,
  promiseOwnProperties,
  promiseWithResolvers,
} from "./ponyfills";
import type { MaybePromise } from "./types";

type Ponyfills = typeof Ponyfills;

/**
 * Test that the ponyfill uses the native implementation if available.
 *
 * Calls resetModules before running the test to ensure that the polyfill in setup is used.
 *
 * Anything modified in setup should be restored in cleanup.
 */
function expectUsesNative<Context extends {}, K extends keyof Ponyfills>(
  nativeName: string,
  ponyfillName: K,
  {
    setup,
    run,
  }: {
    setup: () => { context: Context; cleanup: () => void };
    run: (fn: Ponyfills[K], context: Context) => MaybePromise<void>;
  },
) {
  // eslint-disable-next-line vitest/expect-expect
  it(`calls native ${nativeName} if available`, async () => {
    const { context, cleanup } = setup();
    vi.resetModules();
    await run((await import("./ponyfills"))[ponyfillName], context);
    cleanup();
  });
}

describe("utils > ponyfills", () => {
  describe("mapGetOrInsert", () => {
    it("should insert a value if it does not exist", () => {
      const map = new Map<string, number>();
      const key = "foo";
      const value = 42;
      expect(map.has(key)).toBe(false);

      const result = mapGetOrInsert(map, key, value);

      expect(map.get(key)).toBe(value);
      expect(result).toBe(value);
    });
    it("should return the value if it exists", () => {
      const map = new Map<string, number>([["foo", 42]]);
      const key = "foo";
      const value = 42;
      expect(map.has(key)).toBe(true);

      const result = mapGetOrInsert(map, key, 0);

      expect(result).toBe(value);
    });
    it("should work with weakmaps", () => {
      const map = new WeakMap<object, number>();
      const key = {};
      const value = 42;
      expect(map.has(key)).toBe(false);

      const result = mapGetOrInsert(map, key, value);

      expect(map.get(key)).toBe(value);
      expect(result).toBe(value);

      const result2 = mapGetOrInsert(map, key, 0);

      expect(map.get(key)).toBe(value);
      expect(result2).toBe(value);
    });
    expectUsesNative("Map.prototype.getOrInsert", "mapGetOrInsert", {
      setup() {
        const original = Map.prototype.getOrInsert;

        const mock = vi.fn();

        Map.prototype.getOrInsert = mock;

        return {
          context: mock,
          cleanup() {
            Map.prototype.getOrInsert = original;
          },
        };
      },
      run(mapGetOrInsert, mock) {
        const map = new Map<string, number>();
        const key = "foo";
        const value = 42;

        mapGetOrInsert(map, key, value);

        expect(mock).toHaveBeenCalledWith(key, value);
        expect(mock).toHaveBeenCalledWithContext(map);
      },
    });
  });
  describe("mapGetOrInsertComputed", () => {
    it("should insert a value if it does not exist", () => {
      const map = new Map<string, number>();
      const key = "foo";
      const value = 42;
      expect(map.has(key)).toBe(false);

      const insert = vi.fn(() => value);

      const result = mapGetOrInsertComputed(map, key, insert);

      expect(map.get(key)).toBe(value);
      expect(result).toBe(value);
      expect(insert).toHaveBeenCalledWith(key);
    });
    it("should return the value if it exists", () => {
      const map = new Map<string, number>([["foo", 42]]);
      const key = "foo";
      const value = 42;
      expect(map.has(key)).toBe(true);

      const insert = vi.fn(() => 0);

      const result = mapGetOrInsertComputed(map, key, insert);

      expect(result).toBe(value);
      expect(insert).not.toHaveBeenCalled();
    });
    it("should work with weakmaps", () => {
      const map = new WeakMap<object, number>();
      const key = {};
      const value = 42;
      expect(map.has(key)).toBe(false);

      const insert = vi.fn(() => value);

      const result = mapGetOrInsertComputed(map, key, insert);

      expect(map.get(key)).toBe(value);
      expect(result).toBe(value);
      expect(insert).toHaveBeenCalledWith(key);

      const result2 = mapGetOrInsertComputed(map, key, () => 0);

      expect(map.get(key)).toBe(value);
      expect(result2).toBe(value);
    });
    expectUsesNative(
      "Map.prototype.getOrInsertComputed",
      "mapGetOrInsertComputed",
      {
        setup() {
          const original = Map.prototype.getOrInsertComputed;

          const mock = vi.fn();

          Map.prototype.getOrInsertComputed = mock;

          return {
            context: mock,
            cleanup() {
              Map.prototype.getOrInsertComputed = original;
            },
          };
        },
        run(mapGetOrInsertComputed, mock) {
          const map = new Map<string, number>();
          const key = "foo";
          const value = 42;

          mapGetOrInsertComputed(map, key, () => value);

          expect(mock).toHaveBeenCalledWith(key, expect.any(Function));
          expect(mock).toHaveBeenCalledWithContext(map);
        },
      },
    );
  });
  describe("mapGroupBy", () => {
    it("should group by the key", () => {
      const items = [
        { id: 1, name: "foo" },
        { id: 2, name: "foo" },
        { id: 3, name: "bar" },
      ];
      const result = mapGroupBy(items, (item) => item.name);
      expect(result).toEqual(
        new Map([
          ["foo", [items[0], items[1]]],
          ["bar", [items[2]]],
        ]),
      );
    });
    expectUsesNative("Map.groupBy", "mapGroupBy", {
      setup() {
        const mock = vi.fn();

        const original = Map.groupBy;

        Map.groupBy = mock;

        return {
          context: mock,
          cleanup() {
            Map.groupBy = original;
          },
        };
      },
      run(mapGroupBy, mock) {
        const items = [1];

        mapGroupBy(items, (item) => item);

        expect(mock).toHaveBeenCalledWith(items, expect.any(Function));
        expect(mock).toHaveBeenCalledWithContext(Map);
      },
    });
  });
  describe("objectGroupBy", () => {
    it("should group by the key", () => {
      const items = [
        { id: 1, name: "foo" },
        { id: 2, name: "foo" },
        { id: 3, name: "bar" },
      ];
      const result = objectGroupBy(items, (item) => item.name);
      expect(result).toEqual({ foo: [items[0], items[1]], bar: [items[2]] });
    });
    expectUsesNative("Object.groupBy", "objectGroupBy", {
      setup() {
        const mock = vi.fn();

        const original = Object.groupBy;

        Object.groupBy = mock;

        return {
          context: mock,
          cleanup() {
            Object.groupBy = original;
          },
        };
      },
      run(objectGroupBy, mock) {
        const items = [1];

        objectGroupBy(items, (item) => item);

        expect(mock).toHaveBeenCalledWith(items, expect.any(Function));
        expect(mock).toHaveBeenCalledWithContext(Object);
      },
    });
  });
  describe("promiseFromEntries", () => {
    it("should resolve with the entries", async () => {
      const map = {
        foo: 1,
        bar: Promise.resolve(2),
      };
      const promise = promiseFromEntries(Object.entries(map));
      expect(promise).toBeInstanceOf(Promise);
      await expect(promise).resolves.toEqual({ foo: 1, bar: 2 });
    });
    it("should throw if any entry rejects", async () => {
      const map = {
        foo: 1,
        bar: Promise.reject(new Error("bar")),
      };
      const promise = promiseFromEntries(Object.entries(map));
      expect(promise).toBeInstanceOf(Promise);
      await expect(promise).rejects.toThrow("bar");
    });
    expectUsesNative("Promise.fromEntries", "promiseFromEntries", {
      setup() {
        const original = Promise.fromEntries;

        const mock = vi.fn();

        Promise.fromEntries = mock;

        return {
          context: mock,
          cleanup() {
            Promise.fromEntries = original;
          },
        };
      },
      async run(promiseFromEntries, mock) {
        const entries = [["foo", 1]] as const;

        await promiseFromEntries(entries);

        expect(mock).toHaveBeenCalledWith(entries);
        expect(mock).toHaveBeenCalledWithContext(Promise);
      },
    });
  });
  describe("promiseOwnProperties", () => {
    it("should resolve with the resolved properties", async () => {
      const obj = {
        foo: Promise.resolve(1),
        bar: Promise.resolve(2),
      };
      const promise = promiseOwnProperties(obj);
      expect(promise).toBeInstanceOf(Promise);
      await expect(promise).resolves.toEqual({ foo: 1, bar: 2 });
    });
    it("should reject if any property rejects", async () => {
      const obj = {
        foo: Promise.resolve(1),
        bar: Promise.reject(new Error("bar")),
      };
      const promise = promiseOwnProperties(obj);
      expect(promise).toBeInstanceOf(Promise);
      await expect(promise).rejects.toThrow("bar");
    });
    expectUsesNative("Promise.ownProperties", "promiseOwnProperties", {
      setup() {
        const original = Promise.ownProperties;

        const mock = vi.fn();

        Promise.ownProperties = mock;

        return {
          context: mock,
          cleanup() {
            Promise.ownProperties = original;
          },
        };
      },
      async run(promiseOwnProperties, mock) {
        const obj = { foo: 1 };

        await promiseOwnProperties(obj);

        expect(mock).toHaveBeenCalledWith(obj);
        expect(mock).toHaveBeenCalledWithContext(Promise);
      },
    });
  });
  describe("promiseWithResolvers", () => {
    it("should resolve with the resolvers", async () => {
      const { promise, resolve, reject } = promiseWithResolvers<number>();
      expect(promise).toBeInstanceOf(Promise);
      expect(resolve).toBeInstanceOf(Function);
      expect(reject).toBeInstanceOf(Function);
      resolve(42);
      await expect(promise).resolves.toBe(42);
    });
    it("should reject with the resolvers", async () => {
      const { promise, resolve, reject } = promiseWithResolvers<number>();
      expect(promise).toBeInstanceOf(Promise);
      expect(resolve).toBeInstanceOf(Function);
      expect(reject).toBeInstanceOf(Function);
      reject(new Error("foo"));
      await expect(promise).rejects.toThrow("foo");
    });
    expectUsesNative("Promise.withResolvers", "promiseWithResolvers", {
      setup() {
        const original = Promise.withResolvers;

        const mock = vi.fn();

        Promise.withResolvers = mock;

        return {
          context: mock,
          cleanup() {
            Promise.withResolvers = original;
          },
        };
      },
      run(promiseWithResolvers, mock) {
        promiseWithResolvers();

        expect(mock).toHaveBeenCalled();
        expect(mock).toHaveBeenCalledWithContext(Promise);
      },
    });
  });
});
