import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { isNetworkError } from "@api/offlineMutationEvents";
import { MutationButton } from "@shared/components";
import { UI } from "@modules/profile/constants/ui";
import { useForgotPasswordMutation } from "../api/forgotPasswordMutation";
import { forgotPasswordSchema } from "../schemas";
import type { ForgotPasswordFormValues } from "../types";
import styles from "./ForgotPasswordForm.module.scss";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate, isPending } = useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { usernameOrEmail: "" },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    setErrorMessage("");
    mutate(values, {
      onSuccess: () => setSubmitted(true),
      onError: (err) => {
        if (isNetworkError(err)) return;
        setErrorMessage(UI.password.FORGOT_ERROR);
      },
    });
  };

  if (submitted) {
    return (
      <Alert severity="success" className={styles.successAlert}>
        {UI.password.FORGOT_SUCCESS}
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Controller
          name="usernameOrEmail"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={UI.password.USERNAME_OR_EMAIL_LABEL}
              error={Boolean(errors.usernameOrEmail)}
              helperText={errors.usernameOrEmail?.message}
              fullWidth
              autoFocus
            />
          )}
        />

        <MutationButton
          isPending={isPending}
          label={UI.password.SEND_LINK_BUTTON}
          pendingLabel={UI.password.SENDING}
          fullWidth
        />
      </Stack>
    </Box>
  );
}
