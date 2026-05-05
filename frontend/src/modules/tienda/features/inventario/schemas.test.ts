import { describe, it, expect } from "vitest";
import { ajusteSchema } from "./schemas";

describe("ajusteSchema", () => {
  const validProduct = "550e8400-e29b-41d4-a716-446655440000";
  const validLocation = "660e8400-e29b-41d4-a716-446655440001";

  describe("valid inputs", () => {
    it("should pass valid IN movement", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "5000.50",
        note: "Initial inventory",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it("should pass valid OUT movement", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "OUT" as const,
        quantity: 5,
        unitCost: "5000",
        note: "Stock adjustment",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it("should pass with quantity 1", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 1,
        unitCost: "1000",
        note: "Single unit",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should pass with large quantity", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 99999,
        unitCost: "50000",
        note: "Bulk addition",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should pass with unitCost zero", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "0",
        note: "Free items",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should pass with decimal unitCost", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 5,
        unitCost: "1234.56",
        note: "Decimal cost",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("note validation", () => {
    it("should fail when note is empty string", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "5000",
        note: "",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("note"))).toBe(
          true
        );
      }
    });

    it("should fail when note is missing", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "5000",
        // note missing
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should pass with non-empty note", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "5000",
        note: "Valid note",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("quantity validation", () => {
    it("should fail when quantity is less than 1", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 0,
        unitCost: "5000",
        note: "Invalid qty",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("quantity"))
        ).toBe(true);
      }
    });

    it("should fail when quantity is negative", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: -5,
        unitCost: "5000",
        note: "Negative qty",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail when quantity is a decimal", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10.5,
        unitCost: "5000",
        note: "Decimal qty",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("quantity"))
        ).toBe(true);
      }
    });
  });

  describe("product UUID validation", () => {
    it("should fail with invalid UUID product", () => {
      const input = {
        product: "not-a-uuid",
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "5000",
        note: "Bad product",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("product"))
        ).toBe(true);
      }
    });

    it("should fail with empty string product", () => {
      const input = {
        product: "",
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "5000",
        note: "Empty product",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail with UUID missing hyphens", () => {
      const input = {
        product: "550e8400e29b41d4a716446655440000",
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "5000",
        note: "Bad format",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should pass with valid UUID in uppercase", () => {
      const input = {
        product: "550E8400-E29B-41D4-A716-446655440000",
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "5000",
        note: "Uppercase UUID",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("location UUID validation", () => {
    it("should fail with invalid UUID location", () => {
      const input = {
        product: validProduct,
        location: "invalid-location",
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "5000",
        note: "Bad location",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("location"))
        ).toBe(true);
      }
    });

    it("should fail with empty string location", () => {
      const input = {
        product: validProduct,
        location: "",
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "5000",
        note: "Empty location",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("movementType validation", () => {
    it("should fail when movementType is not IN or OUT", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "INVALID" as unknown as "IN" | "OUT",
        quantity: 10,
        unitCost: "5000",
        note: "Bad movement",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("movementType"))
        ).toBe(true);
      }
    });

    it("should fail when movementType is lowercase in", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "in" as unknown as "IN" | "OUT",
        quantity: 10,
        unitCost: "5000",
        note: "Lowercase in",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail when movementType is lowercase out", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "out" as unknown as "IN" | "OUT",
        quantity: 10,
        unitCost: "5000",
        note: "Lowercase out",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail when movementType is empty", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "" as unknown as "IN" | "OUT",
        quantity: 10,
        unitCost: "5000",
        note: "Empty movement",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("unitCost validation", () => {
    it("should fail when unitCost is empty string", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "",
        note: "Empty cost",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("unitCost"))
        ).toBe(true);
      }
    });

    it("should fail when unitCost is negative", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "-5000",
        note: "Negative cost",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail when unitCost is non-numeric", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 10,
        unitCost: "abc",
        note: "Non-numeric",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should pass with large numeric unitCost", () => {
      const input = {
        product: validProduct,
        location: validLocation,
        movementType: "IN" as const,
        quantity: 1,
        unitCost: "999999999.99",
        note: "Large cost",
      };

      const result = ajusteSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});
