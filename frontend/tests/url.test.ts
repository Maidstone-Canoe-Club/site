import { expect, test, describe } from "vitest";
import { buildQueryParams, isExternal } from "~/utils/url";

describe("URL utilities", () => {
  describe("buildQueryParams", () => {
    test("should return a query string from an object", () => {
      const params = { name: "John", age: "30", city: "New York" };
      const result = buildQueryParams(params);
      expect(result).toBe("?name=John&age=30&city=New York");
    });

    test("should ignore empty objects", () => {
      const params = {};
      const result = buildQueryParams(params);
      expect(result).toBe("");
    });

    test("should return '?' for null or undefined", () => {
      expect(buildQueryParams(null)).toBe("");
      expect(buildQueryParams(undefined)).toBe("");
    });
  });

  describe("isExternal", () => {
    test("should return true for external URLs", () => {
      expect(isExternal("https://external.com")).toBe(true);
      expect(isExternal("http://external.com")).toBe(true);
      expect(isExternal("mailto:user@example.com")).toBe(true);
      expect(isExternal("tel:+18001234567")).toBe(true);
    });

    test("should return false for non-external URLs", () => {
      expect(isExternal("/internal/path")).toBe(false);
      expect(isExternal("relative/path")).toBe(false);
    });
  });
});
