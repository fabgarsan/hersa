import { z } from "zod";

import { UI } from "../../constants/ui";

const { password: msg } = UI;

const newPasswordField = z
  .string()
  .min(1, msg.NEW_REQUIRED)
  .min(8, msg.MIN_LENGTH)
  .refine((v) => !/^\d+$/.test(v), msg.ONLY_NUMERIC);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, msg.CURRENT_REQUIRED),
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, msg.CONFIRM_REQUIRED),
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: msg.PASSWORDS_MISMATCH,
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  usernameOrEmail: z.string().min(1, msg.USERNAME_OR_EMAIL_REQUIRED),
});

export const resetPasswordSchema = z
  .object({
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, msg.CONFIRM_REQUIRED),
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: msg.PASSWORDS_MISMATCH,
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
