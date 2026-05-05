import { describe, it, expect } from "vitest";
import { assertUuid } from "./assertUuid";

describe("assertUuid", () => {
  it("should pass for valid UUID in lowercase", () => {
    const validUuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(() => assertUuid(validUuid)).not.toThrow();
  });

  it("should pass for valid UUID in uppercase", () => {
    const validUuid = "550E8400-E29B-41D4-A716-446655440000";
    expect(() => assertUuid(validUuid)).not.toThrow();
  });

  it("should pass for valid UUID in mixed case", () => {
    const validUuid = "550e8400-E29B-41d4-A716-446655440000";
    expect(() => assertUuid(validUuid)).not.toThrow();
  });

  it("should throw error for invalid UUID with message", () => {
    const invalidUuid = "not-a-uuid";
    expect(() => assertUuid(invalidUuid)).toThrow(
      'ID inválido: "not-a-uuid"'
    );
  });

  it("should throw error for empty string", () => {
    expect(() => assertUuid("")).toThrow('ID inválido: ""');
  });

  it("should throw error for UUID with wrong format", () => {
    const badUuid = "550e8400e29b41d4a716446655440000"; // missing hyphens
    expect(() => assertUuid(badUuid)).toThrow(`ID inválido: "${badUuid}"`);
  });

  it("should throw error for partial UUID", () => {
    const partialUuid = "550e8400-e29b-41d4-a716";
    expect(() => assertUuid(partialUuid)).toThrow(
      `ID inválido: "${partialUuid}"`
    );
  });

  it("should include context in error message when provided", () => {
    const invalidUuid = "bad-id";
    expect(() => assertUuid(invalidUuid, "producto")).toThrow(
      'ID inválido en producto: "bad-id"'
    );
  });

  it("should include context in error message for empty string", () => {
    expect(() => assertUuid("", "jornada")).toThrow(
      'ID inválido en jornada: ""'
    );
  });
});
