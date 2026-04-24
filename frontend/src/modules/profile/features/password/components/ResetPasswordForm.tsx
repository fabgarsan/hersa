import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { PasswordTextField, SubmitButton } from "@shared/components";
import { ROUTES } from "@shared/constants/routes";
import { UI } from "../../../constants/ui";
import { useResetPasswordMutation } from "../api/resetPasswordMutation";
import { resetPasswordSchema } from "../schemas";
import type { ResetPasswordFormProps, ResetPasswordFormValues } from "../types";
import styles from "./ResetPasswordForm.module.scss";

export function ResetPasswordForm({ uid, token }: ResetPasswordFormProps) {
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate, isPending } = useResetPasswordMutation();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    setErrorMessage("");
    mutate(
      { ...values, uid, token },
      {
        onSuccess: () => setSuccess(true),
        onError: (err) => {
          const data = (err as { response?: { data?: Record<string, unknown> } }).response?.data;
          if (data?.confirm_password) {
            setError("confirmPassword", { message: String(data.confirm_password) });
          } else if (data?.new_password) {
            const msg = Array.isArray(data.new_password) ? data.new_password[0] : data.new_password;
            setError("newPassword", { message: String(msg) });
          } else {
            setErrorMessage(String(data?.detail ?? UI.password.RESET_LINK_INVALID));
          }
        },
      },
    );
  };

  if (success) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Alert severity="success" className={styles.successAlert}>
          {UI.password.RESET_SUCCESS}
        </Alert>
        <Button variant="contained" color="primary" onClick={() => navigate(ROUTES.HOME)}>
          {UI.password.GO_TO_LOGIN}
        </Button>
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        {errorMessage && (
          <Stack spacing={1}>
            <Alert severity="error">{errorMessage}</Alert>
            <Typography
              variant="body2"
              color="primary"
              className={styles.requestNewLink}
              onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
            >
              {UI.password.REQUEST_NEW_LINK}
            </Typography>
          </Stack>
        )}

        <PasswordTextField
          name="newPassword"
          control={control}
          label={UI.password.NEW_LABEL}
          error={errors.newPassword}
          autoFocus
        />

        <PasswordTextField
          name="confirmPassword"
          control={control}
          label={UI.password.CONFIRM_LABEL}
          error={errors.confirmPassword}
        />

        <SubmitButton
          isPending={isPending}
          label={UI.password.RESET_BUTTON}
          pendingLabel={UI.password.RESETTING}
          fullWidth
        />
      </Stack>
    </Box>
  );
}
