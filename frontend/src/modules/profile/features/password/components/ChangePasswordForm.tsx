import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { AxiosError } from "axios";

import { PasswordTextField, SubmitButton } from "@shared/components";
import { UI } from "../../../constants/ui";
import { useChangePasswordMutation } from "../api/changePasswordMutation";
import { changePasswordSchema } from "../schemas";
import type { ChangePasswordFormProps, ChangePasswordFormValues } from "../types";
import styles from "./ChangePasswordForm.module.scss";

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate, isPending } = useChangePasswordMutation();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    setSuccessMessage("");
    setErrorMessage("");
    mutate(values, {
      onSuccess: () => {
        setSuccessMessage(UI.password.CHANGE_SUCCESS);
        reset();
        onSuccess?.();
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<Record<string, string | string[]>>;
        const data = axiosErr.response?.data;
        if (data?.current_password) {
          setError("currentPassword", { message: String(data.current_password) });
        } else if (data?.new_password) {
          const msg = Array.isArray(data.new_password) ? data.new_password[0] : data.new_password;
          setError("newPassword", { message: String(msg) });
        } else {
          setErrorMessage(UI.password.CHANGE_ERROR);
        }
      },
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
      <Stack spacing={2.5}>
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <PasswordTextField
          name="currentPassword"
          control={control}
          label={UI.password.CURRENT_LABEL}
          error={errors.currentPassword}
        />

        <PasswordTextField
          name="newPassword"
          control={control}
          label={UI.password.NEW_LABEL}
          error={errors.newPassword}
        />

        <PasswordTextField
          name="confirmPassword"
          control={control}
          label={UI.password.CONFIRM_LABEL}
          error={errors.confirmPassword}
        />

        <SubmitButton
          isPending={isPending}
          label={UI.password.CHANGE_BUTTON}
          pendingLabel={UI.password.CHANGING}
          fullWidth={false}
        />
      </Stack>
    </Box>
  );
}
