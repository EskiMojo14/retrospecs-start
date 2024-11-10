import { describe, expect, it, vi } from "vitest";
import {
  mapEmplace,
  mapGroupBy,
  objectGroupBy,
  promiseFromEntries,
  promiseOwnProperties,
  promiseWithResolvers,
} from "./ponyfills";

describe("utils > ponyfills", () => {
  describe("mapEmplace", () => {
    it("should insert a value if it does not exist", () => {
      const map = new Map<string, number>();
      const key = "foo";
      const value = 42;
      expect(map.has(key)).toBe(false);

      const insert = vi.fn(() => value);

      const result = mapEmplace(map, key, {
        insert,
      });

      expect(map.get(key)).toBe(value);
      expect(result).toBe(value);
      expect(insert).toHaveBeenCalledWith(key, map);
    });
    it("should update a value if it exists", () => {
      const map = new Map<string, number>([["foo", 42]]);
      const key = "foo";
      const value = 42;
      expect(map.has(key)).toBe(true);

      const update = vi.fn((n: number) => ++n);

      const result = mapEmplace(map, key, {
        update,
      });

      expect(result).toBe(value + 1);
      expect(map.get(key)).toBe(value + 1);
      expect(update).toHaveBeenCalledWith(value, key, map);
    });
    it("should throw an error if the key is not found and no insert handler is provided", () => {
      const map = new Map<string, number>();
      const key = "foo";
      expect(map.has(key)).toBe(false);

      expect(() => mapEmplace(map, key, {})).toThrowErrorMatchingInlineSnapshot(
        `[Error: No insert provided for key not already in map]`,
      );
    });
    it("should return the value if it exists, even if no update handler is provided", () => {
      const map = new Map<string, number>([["foo", 42]]);
      const key = "foo";
      const value = 42;
      expect(map.has(key)).toBe(true);

      const result = mapEmplace(map, key, {});

      expect(result).toBe(value);
    });
  });
  describe("mapEmplace (WeakMap)", () => {
    it("should insert a value if it does not exist", () => {
      const map = new WeakMap<object, number>();
      const key = {};
      const value = 42;
      expect(map.has(key)).toBe(false);

      const insert = vi.fn(() => value);

      const result = mapEmplace(map, key, {
        insert,
      });

      expect(map.get(key)).toBe(value);
      expect(result).toBe(value);
      expect(insert).toHaveBeenCalledWith(key, map);
    });
    it("should update a value if it exists", () => {
      const map = new WeakMap<object, number>();
      const key = {};
      const value = 42;
      map.set(key, value);
      expect(map.has(key)).toBe(true);

      const update = vi.fn((n: number) => ++n);

      const result = mapEmplace(map, key, {
        update,
      });

      expect(result).toBe(value + 1);
      expect(map.get(key)).toBe(value + 1);
      expect(update).toHaveBeenCalledWith(value, key, map);
    });
    it("should throw an error if the key is not found and no insert handler is provided", () => {
      const map = new WeakMap<object, number>();
      const key = {};
      expect(map.has(key)).toBe(false);

      expect(() => mapEmplace(map, key, {})).toThrowErrorMatchingInlineSnapshot(
        `[Error: No insert provided for key not already in map]`,
      );
    });
    it("should return the value if it exists, even if no update handler is provided", () => {
      const map = new WeakMap<object, number>();
      const key = {};
      const value = 42;
      map.set(key, value);
      expect(map.has(key)).toBe(true);

      const result = mapEmplace(map, key, {});

      expect(result).toBe(value);
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
  });
});
