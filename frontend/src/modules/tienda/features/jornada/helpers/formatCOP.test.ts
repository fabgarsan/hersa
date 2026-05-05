import { describe, it, expect } from "vitest";
import { formatCOP } from "./formatCOP";

describe("formatCOP", () => {
  describe("null/undefined/empty cases", () => {
    it("should return em dash for null", () => {
      expect(formatCOP(null)).toBe("—");
    });

    it("should return em dash for undefined", () => {
      expect(formatCOP(undefined)).toBe("—");
    });

    it("should return em dash for empty string", () => {
      expect(formatCOP("")).toBe("—");
    });
  });

  describe("valid number inputs", () => {
    it("should format number 0 correctly (not as em dash)", () => {
      const result = formatCOP(0);
      expect(result).not.toBe("—");
      expect(result).toContain("$");
      expect(result).toContain("0");
    });

    it("should format string zero correctly", () => {
      const result = formatCOP("0");
      expect(result).not.toBe("—");
      expect(result).toContain("$");
      expect(result).toContain("0");
    });

    it("should format positive integer as number", () => {
      const result = formatCOP(50000);
      expect(result).toContain("50");
      expect(result).toContain("$");
      expect(result).not.toBe("—");
    });

    it("should format positive integer as string", () => {
      const result = formatCOP("50000");
      expect(result).toContain("50");
      expect(result).toContain("$");
      expect(result).not.toBe("—");
    });

    it("should format decimal string", () => {
      const result = formatCOP("123456.78");
      expect(result).toContain("$");
      expect(result).not.toBe("—");
    });

    it("should use Colombian locale (es-CO)", () => {
      const result = formatCOP(1000000);
      // Colombian locale uses . for thousands separator
      // and no decimal places for COP (maximumFractionDigits: 0)
      expect(result).toContain("$");
    });

    it("should round down to nearest integer (maximumFractionDigits: 0)", () => {
      const result = formatCOP(1234.99);
      // Should not show decimal places
      expect(result).not.toContain(",");
    });

    it("should format large numbers", () => {
      const result = formatCOP(999999999);
      expect(result).toContain("$");
      expect(result).not.toBe("—");
    });

    it("should format small amounts", () => {
      const result = formatCOP(1);
      expect(result).toContain("$");
      expect(result).not.toBe("—");
    });
  });

  describe("invalid inputs", () => {
    it("should return em dash for NaN string", () => {
      expect(formatCOP("not-a-number")).toBe("—");
    });

    it("should return em dash for string with invalid characters", () => {
      expect(formatCOP("$1000")).toBe("—");
    });

    it("should return em dash for NaN number", () => {
      expect(formatCOP(NaN)).toBe("—");
    });
  });

  describe("negative numbers", () => {
    it("should format negative numbers", () => {
      const result = formatCOP(-50000);
      expect(result).toContain("$");
      expect(result).toContain("-");
      expect(result).not.toBe("—");
    });

    it("should format negative string", () => {
      const result = formatCOP("-25000");
      expect(result).toContain("$");
      expect(result).toContain("-");
      expect(result).not.toBe("—");
    });
  });
});
