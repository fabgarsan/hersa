import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";

import { isApiErrorData } from "@api/client";
import { isNetworkError } from "@api/offlineMutationEvents";
import { MutationButton, PasswordTextField } from "@shared/components";
import { UI } from "@modules/profile/constants/ui";
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
        if (isNetworkError(err)) return;
        if (axios.isAxiosError(err) && isApiErrorData(err.response?.data)) {
          const data = err.response.data;
          if (data["currentPassword"]) {
            setError("currentPassword", { message: String(data["currentPassword"]) });
          } else if (data["newPassword"]) {
            const msg = Array.isArray(data["newPassword"])
              ? data["newPassword"][0]
              : data["newPassword"];
            setError("newPassword", { message: String(msg) });
          } else {
            setErrorMessage(UI.password.CHANGE_ERROR);
          }
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

        <MutationButton
          isPending={isPending}
          label={UI.password.CHANGE_BUTTON}
          pendingLabel={UI.password.CHANGING}
          fullWidth={false}
        />
      </Stack>
    </Box>
  );
}
