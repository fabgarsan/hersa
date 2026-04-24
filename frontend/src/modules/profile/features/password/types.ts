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
