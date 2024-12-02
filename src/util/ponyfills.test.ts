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

/**
 * Setup a mock, then reimport the module after clearing cache.
 * Cleanup function returned by setup is called once tests are done.
 */
async function importWithMock(setup: () => () => void) {
  const dispose = setup();
  vi.resetModules();
  return Object.assign(await import("./ponyfills"), {
    [Symbol.dispose]: dispose,
  } satisfies Disposable);
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
    it("should call native Map.prototype.getOrInsert if available", async () => {
      using ponyfills = await importWithMock(() => {
        const original = Map.prototype.getOrInsert;

        Map.prototype.getOrInsert = vi.fn();

        return () => {
          Map.prototype.getOrInsert = original;
        };
      });

      const map = new Map<string, number>();
      const key = "foo";
      const value = 42;

      ponyfills.mapGetOrInsert(map, key, value);

      expect(Map.prototype.getOrInsert).toHaveBeenCalledWith(key, value);
      expect(Map.prototype.getOrInsert).toHaveBeenCalledWithContext(map);
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
    it("should call native Map.prototype.getOrInsertComputed if available", async () => {
      using ponyfills = await importWithMock(() => {
        const original = Map.prototype.getOrInsertComputed;

        Map.prototype.getOrInsertComputed = vi.fn();

        return () => {
          Map.prototype.getOrInsertComputed = original;
        };
      });

      const map = new Map<string, number>();
      const key = "foo";
      const value = 42;

      ponyfills.mapGetOrInsertComputed(map, key, () => value);

      expect(Map.prototype.getOrInsertComputed).toHaveBeenCalledWith(
        key,
        expect.any(Function),
      );
      expect(Map.prototype.getOrInsertComputed).toHaveBeenCalledWithContext(
        map,
      );
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
    it("calls native Map.groupBy if available", async () => {
      using ponyfills = await importWithMock(() => {
        const original = Map.groupBy;

        Map.groupBy = vi.fn();

        return () => {
          Map.groupBy = original;
        };
      });

      const items = [1];

      ponyfills.mapGroupBy(items, (item) => item);

      expect(Map.groupBy).toHaveBeenCalledWith(items, expect.any(Function));
      expect(Map.groupBy).toHaveBeenCalledWithContext(Map);
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
    it("calls native Object.groupBy if available", async () => {
      using ponyfills = await importWithMock(() => {
        const original = Object.groupBy;

        Object.groupBy = vi.fn();

        return () => {
          Object.groupBy = original;
        };
      });

      const items = [1];

      ponyfills.objectGroupBy(items, (item) => item);

      expect(Object.groupBy).toHaveBeenCalledWith(items, expect.any(Function));
      expect(Object.groupBy).toHaveBeenCalledWithContext(Object);
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
    it("should call native Promise.fromEntries if available", async () => {
      using ponyfills = await importWithMock(() => {
        const original = Promise.fromEntries;

        Promise.fromEntries = vi.fn();

        return () => {
          Promise.fromEntries = original;
        };
      });

      const entries = [["foo", 1]] as const;

      await ponyfills.promiseFromEntries(entries);

      expect(Promise.fromEntries).toHaveBeenCalledWith(entries);
      expect(Promise.fromEntries).toHaveBeenCalledWithContext(Promise);
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
    it("should call native Promise.ownProperties if available", async () => {
      using ponyfills = await importWithMock(() => {
        const original = Promise.ownProperties;

        Promise.ownProperties = vi.fn();

        return () => {
          Promise.ownProperties = original;
        };
      });

      const obj = { foo: 1 };

      await ponyfills.promiseOwnProperties(obj);

      expect(Promise.ownProperties).toHaveBeenCalledWith(obj);
      expect(Promise.ownProperties).toHaveBeenCalledWithContext(Promise);
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
    it("should call native Promise.withResolvers if available", async () => {
      using ponyfills = await importWithMock(() => {
        const original = Promise.withResolvers;

        Promise.withResolvers = vi.fn();

        return () => {
          Promise.withResolvers = original;
        };
      });

      ponyfills.promiseWithResolvers();

      expect(Promise.withResolvers).toHaveBeenCalled();
      expect(Promise.withResolvers).toHaveBeenCalledWithContext(Promise);
    });
  });
});
