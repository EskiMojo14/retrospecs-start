/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, it, vi } from "vitest";
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

/**
 * Test that the ponyfill uses the native implementation if available.
 *
 * Calls resetModules before running the test to ensure that the polyfill in setup is used.
 *
 * Anything modified in setup should be restored in cleanup.
 */
function expectUsesNative<Context extends {}>(
  description: string,
  {
    setup,
    run,
    cleanup,
  }: {
    setup: () => Context;
    run: (
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      module: typeof import("./ponyfills"),
      context: Context,
    ) => MaybePromise<void>;
    cleanup: (context: Context) => void;
  },
) {
  // eslint-disable-next-line vitest/expect-expect
  it(description, async () => {
    const context = setup();
    vi.resetModules();
    await run(await import("./ponyfills"), context);
    cleanup(context);
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
    expectUsesNative("should call native getOrInsert if available", {
      setup() {
        const original = Map.prototype.getOrInsert;

        const mock = vi.fn();

        Map.prototype.getOrInsert = mock;

        return { mock, original };
      },
      run(m, { mock }) {
        const map = new Map<string, number>();
        const key = "foo";
        const value = 42;

        m.mapGetOrInsert(map, key, value);

        expect(mock).toHaveBeenCalledWith(key, value);
        expect(mock).toHaveBeenCalledWithContext(map);
      },
      cleanup({ original }) {
        Map.prototype.getOrInsert = original;
      },
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
      expectUsesNative("should call native getOrInsertComputed if available", {
        setup() {
          const original = Map.prototype.getOrInsertComputed;

          const mock = vi.fn();

          Map.prototype.getOrInsertComputed = mock;

          return { mock, original };
        },
        run(m, { mock }) {
          const map = new Map<string, number>();
          const key = "foo";
          const value = 42;

          m.mapGetOrInsertComputed(map, key, () => value);

          expect(mock).toHaveBeenCalledWith(key, expect.any(Function));
          expect(mock).toHaveBeenCalledWithContext(map);
        },
        cleanup({ original }) {
          Map.prototype.getOrInsertComputed = original;
        },
      });
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
      expectUsesNative("should call native Map.groupBy if available", {
        setup() {
          const mock = vi.fn();

          const original = Map.groupBy;

          Map.groupBy = mock;

          return { mock, original };
        },
        run(m, { mock }) {
          const items = [1];

          m.mapGroupBy(items, (item) => item);

          expect(mock).toHaveBeenCalledWith(items, expect.any(Function));
          expect(mock).toHaveBeenCalledWithContext(Map);
        },
        cleanup({ original }) {
          Map.groupBy = original;
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
      expectUsesNative("should call native Object.groupBy if available", {
        setup() {
          const mock = vi.fn();

          const original = Object.groupBy;

          Object.groupBy = mock;

          return { mock, original };
        },
        run(m, { mock }) {
          const items = [1];

          m.objectGroupBy(items, (item) => item);

          expect(mock).toHaveBeenCalledWith(items, expect.any(Function));
          expect(mock).toHaveBeenCalledWithContext(Object);
        },
        cleanup({ original }) {
          Object.groupBy = original;
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
      expectUsesNative("should call native Promise.fromEntries if available", {
        setup() {
          const original = Promise.fromEntries;

          const mock = vi.fn();

          Promise.fromEntries = mock;

          return { mock, original };
        },
        async run(m, { mock }) {
          const entries = [["foo", 1]] as const;

          await m.promiseFromEntries(entries);

          expect(mock).toHaveBeenCalledWith(entries);
          expect(mock).toHaveBeenCalledWithContext(Promise);
        },
        cleanup({ original }) {
          Promise.fromEntries = original;
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
      expectUsesNative(
        "should call native Promise.ownProperties if available",
        {
          setup() {
            const original = Promise.ownProperties;

            const mock = vi.fn();

            Promise.ownProperties = mock;

            return { mock, original };
          },
          async run(m, { mock }) {
            const obj = { foo: 1 };

            await m.promiseOwnProperties(obj);

            expect(mock).toHaveBeenCalledWith(obj);
            expect(mock).toHaveBeenCalledWithContext(Promise);
          },
          cleanup({ original }) {
            Promise.ownProperties = original;
          },
        },
      );
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
      expectUsesNative(
        "should call native Promise.withResolvers if available",
        {
          setup() {
            const original = Promise.withResolvers;

            const mock = vi.fn();

            Promise.withResolvers = mock;

            return { mock, original };
          },
          run(m, { mock }) {
            m.promiseWithResolvers();

            expect(mock).toHaveBeenCalled();
            expect(mock).toHaveBeenCalledWithContext(Promise);
          },
          cleanup({ original }) {
            Promise.withResolvers = original;
          },
        },
      );
    });
  });
});
