import { describe, it, expect } from "vitest";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas";

describe("changePasswordSchema", () => {
  describe("valid inputs", () => {
    it("should accept valid passwords that match and meet requirements", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        currentPassword: "oldPassword123",
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      });
    });

    it("should accept new password with exactly 8 characters", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "Pass1234",
        confirmPassword: "Pass1234",
      });
      expect(result.success).toBe(true);
    });

    it("should accept new password with mixed alphanumeric characters", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "myPass123word",
        confirmPassword: "myPass123word",
      });
      expect(result.success).toBe(true);
    });

    it("should accept new password with special characters", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "Pass!@#$1234",
        confirmPassword: "Pass!@#$1234",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("currentPassword validation", () => {
    it("should reject empty current password", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "",
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.currentPassword?.[0]).toBe(
          "La contraseña actual es obligatoria."
        );
      }
    });

    it("should reject missing current password", () => {
      const result = changePasswordSchema.safeParse({
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("newPassword validation", () => {
    it("should reject empty new password", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "",
        confirmPassword: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword?.[0]).toBe(
          "La nueva contraseña es obligatoria."
        );
      }
    });

    it("should reject new password shorter than 8 characters", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "Pass123",
        confirmPassword: "Pass123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword?.[0]).toBe(
          "La contraseña debe tener al menos 8 caracteres."
        );
      }
    });

    it("should reject new password with only numeric characters", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "12345678",
        confirmPassword: "12345678",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword?.[0]).toBe(
          "La contraseña no puede ser completamente numérica."
        );
      }
    });

    it("should accept new password with letters and numbers", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "Pass123456",
        confirmPassword: "Pass123456",
      });
      expect(result.success).toBe(true);
    });

    it("should accept new password with only letters", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "PasswordOnly",
        confirmPassword: "PasswordOnly",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("confirmPassword validation", () => {
    it("should reject empty confirm password", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "newPassword456",
        confirmPassword: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBe(
          "Confirma tu nueva contraseña."
        );
      }
    });

    it("should reject when confirm password does not match new password", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "newPassword456",
        confirmPassword: "differentPassword",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBe(
          "Las contraseñas no coinciden."
        );
      }
    });

    it("should reject with case sensitivity mismatch", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "newPassword456",
        confirmPassword: "NewPassword456",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("error priority", () => {
    it("should show newPassword error before confirmPassword when newPassword is too short", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword123",
        newPassword: "short",
        confirmPassword: "newPassword456",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.newPassword).toBeDefined();
      }
    });
  });
});

describe("forgotPasswordSchema", () => {
  describe("valid inputs", () => {
    it("should accept valid username", () => {
      const result = forgotPasswordSchema.safeParse({
        usernameOrEmail: "testuser",
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ usernameOrEmail: "testuser" });
    });

    it("should accept valid email", () => {
      const result = forgotPasswordSchema.safeParse({
        usernameOrEmail: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should accept email with special characters in local part", () => {
      const result = forgotPasswordSchema.safeParse({
        usernameOrEmail: "user.name+tag@example.com",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("usernameOrEmail validation", () => {
    it("should reject empty usernameOrEmail", () => {
      const result = forgotPasswordSchema.safeParse({
        usernameOrEmail: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.usernameOrEmail?.[0]).toBe(
          "Ingresa tu usuario o correo electrónico."
        );
      }
    });

    it("should reject missing usernameOrEmail field", () => {
      const result = forgotPasswordSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.usernameOrEmail).toBeDefined();
      }
    });

    it("should accept whitespace-padded input (user responsibility)", () => {
      const result = forgotPasswordSchema.safeParse({
        usernameOrEmail: "  testuser  ",
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("resetPasswordSchema", () => {
  describe("valid inputs", () => {
    it("should accept valid reset password data", () => {
      const result = resetPasswordSchema.safeParse({
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      });
    });

    it("should accept new password with exactly 8 characters", () => {
      const result = resetPasswordSchema.safeParse({
        newPassword: "Pass1234",
        confirmPassword: "Pass1234",
      });
      expect(result.success).toBe(true);
    });

    it("should accept new password with mixed case and numbers", () => {
      const result = resetPasswordSchema.safeParse({
        newPassword: "ResetPass123",
        confirmPassword: "ResetPass123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("newPassword validation", () => {
    it("should reject empty new password", () => {
      const result = resetPasswordSchema.safeParse({
        newPassword: "",
        confirmPassword: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword?.[0]).toBe(
          "La nueva contraseña es obligatoria."
        );
      }
    });

    it("should reject new password shorter than 8 characters", () => {
      const result = resetPasswordSchema.safeParse({
        newPassword: "Pass123",
        confirmPassword: "Pass123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword?.[0]).toBe(
          "La contraseña debe tener al menos 8 caracteres."
        );
      }
    });

    it("should reject new password with only numeric characters", () => {
      const result = resetPasswordSchema.safeParse({
        newPassword: "87654321",
        confirmPassword: "87654321",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword?.[0]).toBe(
          "La contraseña no puede ser completamente numérica."
        );
      }
    });
  });

  describe("confirmPassword validation", () => {
    it("should reject empty confirm password", () => {
      const result = resetPasswordSchema.safeParse({
        newPassword: "newPassword456",
        confirmPassword: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBe(
          "Confirma tu nueva contraseña."
        );
      }
    });

    it("should reject when confirm password does not match new password", () => {
      const result = resetPasswordSchema.safeParse({
        newPassword: "newPassword456",
        confirmPassword: "differentPassword789",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBe(
          "Las contraseñas no coinciden."
        );
      }
    });

    it("should be case sensitive for password matching", () => {
      const result = resetPasswordSchema.safeParse({
        newPassword: "NewPassword456",
        confirmPassword: "newPassword456",
      });
      expect(result.success).toBe(false);
    });
  });
});
