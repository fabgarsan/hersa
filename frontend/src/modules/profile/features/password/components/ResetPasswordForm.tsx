import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { isApiErrorData } from "@api/client";
import { isNetworkError } from "@api/offlineMutationEvents";
import { MutationButton, PasswordTextField } from "@shared/components";
import { ROUTES } from "@shared/constants/routes";
import { UI } from "@modules/profile/constants/ui";
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
          if (isNetworkError(err)) return;
          if (axios.isAxiosError(err) && isApiErrorData(err.response?.data)) {
            const data = err.response.data;
            if (data["confirmPassword"]) {
              setError("confirmPassword", { message: String(data["confirmPassword"]) });
            } else if (data["newPassword"]) {
              const msg = Array.isArray(data["newPassword"])
                ? data["newPassword"][0]
                : data["newPassword"];
              setError("newPassword", { message: String(msg) });
            } else {
              setErrorMessage(String(data["detail"] ?? UI.password.RESET_LINK_INVALID));
            }
          } else {
            setErrorMessage(UI.password.RESET_LINK_INVALID);
          }
        },
      },
    );
  };

  if (success) {
    return (
      <Stack spacing={2} className={styles.successStack}>
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

        <MutationButton
          isPending={isPending}
          label={UI.password.RESET_BUTTON}
          pendingLabel={UI.password.RESETTING}
          fullWidth
        />
      </Stack>
    </Box>
  );
}
