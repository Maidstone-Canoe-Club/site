import type { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { describe, expect, it, beforeEach } from "vitest";
import { hasExactRole, hasRole } from "~/utils/roles";

describe("Role functions", () => {
  let mockUser: DirectusUser;

  beforeEach(() => {
    mockUser = {
      role: {
        name: "Junior"
        // add other properties pertinent to the DirectusUser role structure
      }
      // insert other fields for DirectusUser
    };
  });

  describe("exact role checking", () => {
    it("should return true for correct role", () => {
      expect(hasExactRole(mockUser, "junior")).toBe(true);
    });

    it("should return false for incorrect role", () => {
      expect(hasExactRole(mockUser, "senior")).toBe(false);
    });

    it("should return false for null user", () => {
      expect(hasExactRole(null, "senior")).toBe(false);
    });

    it("should return false for missing role", () => {
      delete mockUser.role;
      expect(hasExactRole(mockUser, "senior")).toBe(false);
    });

    // add more tests as needed
  });

  describe("role level checking", () => {
    beforeEach(() => {
      mockUser.role.name = "member";
    });

    it("should return true for lower role", () => {
      expect(hasRole(mockUser, "junior")).toBe(true);
    });

    it("should return false for higher role", () => {
      expect(hasRole(mockUser, "administrator")).toBe(false);
    });

    // add more tests as needed
  });
});
