import { parse, string } from "valibot";
import { describe, expect, it, vi } from "vitest";
import { entriesFromList, coerceNumber, numberParamsSchema } from "./valibot";

describe("util / valibot", () => {
  describe("entriesFromList", () => {
    const schema = string();
    const keys = ["a", "b"] as const;
    const expected = { a: schema, b: schema };
    it("should return an object with the keys and the schema", () => {
      expect(entriesFromList(keys, schema)).toEqual(expected);
    });
    it("should call factory with the key", () => {
      const factory = vi.fn(() => schema);
      expect(entriesFromList(keys, factory)).toEqual(expected);
      for (const key of keys) {
        expect(factory).toHaveBeenCalledWith(key);
      }
    });
  });
  describe("coerceNumber", () => {
    it("should coerce a string to a number", () => {
      expect(parse(coerceNumber(), "1")).toBe(1);
    });
    it("should coerce a number to a number", () => {
      expect(parse(coerceNumber(), "1")).toBe(1);
    });
    it("should throw an error if the value is not a number", () => {
      expect(() =>
        parse(coerceNumber(), "a"),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValiError: Invalid type: Expected (number | string) but received "a"]`,
      );
    });
    it("uses custom message", () => {
      expect(() =>
        parse(coerceNumber("Custom message"), "a"),
      ).toThrowErrorMatchingInlineSnapshot(`[ValiError: Custom message]`);
    });
  });
  describe("numberParamsSchema", () => {
    it("should coerce a string to a number", () => {
      expect(parse(numberParamsSchema("a"), { a: "1" })).toEqual({ a: 1 });
    });
    it("should coerce a number to a number", () => {
      expect(parse(numberParamsSchema("a"), { a: 1 })).toEqual({ a: 1 });
    });
    it("should throw an error if the value is not a number", () => {
      expect(() =>
        parse(numberParamsSchema("a"), { a: "a" }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[ValiError: Invalid number provided for "a", received: "a"]`,
      );
    });
  });
});
