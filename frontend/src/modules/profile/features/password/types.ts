export type {
  ChangePasswordFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from "./schemas";

export interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export interface ResetPasswordFormProps {
  uid: string;
  token: string;
}

import type { ResetPasswordFormValues } from "./schemas";

export interface ResetPasswordPayload extends ResetPasswordFormValues {
  uid: string;
  token: string;
}
