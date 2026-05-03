import { describe, it, expect } from "vitest";
import { loginSchema } from "../schemas";

describe("loginSchema", () => {
  describe("valid inputs", () => {
    it("should accept valid username and password", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "password123",
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        username: "testuser",
        password: "password123",
      });
    });

    it("should accept minimum valid inputs (single character)", () => {
      const result = loginSchema.safeParse({
        username: "u",
        password: "p",
      });
      expect(result.success).toBe(true);
    });

    it("should accept long username and password", () => {
      const result = loginSchema.safeParse({
        username: "very.long.username@example.com",
        password: "veryLongPasswordWith123SpecialChars!@#",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("empty username", () => {
    it("should reject empty username", () => {
      const result = loginSchema.safeParse({
        username: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.username?.[0]).toBe("El usuario es obligatorio.");
      }
    });

    it("should reject missing username field", () => {
      const result = loginSchema.safeParse({
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.username).toBeDefined();
      }
    });
  });

  describe("empty password", () => {
    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password?.[0]).toBe("La contraseña es obligatoria.");
      }
    });

    it("should reject missing password field", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });
  });

  describe("both fields empty", () => {
    it("should reject when both username and password are empty", () => {
      const result = loginSchema.safeParse({
        username: "",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
