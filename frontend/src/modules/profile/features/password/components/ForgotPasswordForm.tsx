import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { UI } from "../../../constants/ui";
import { useForgotPasswordMutation } from "../api/forgotPasswordMutation";
import { forgotPasswordSchema } from "../schemas";
import type { ForgotPasswordFormValues } from "../types";

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
      onError: () => setErrorMessage(UI.password.FORGOT_ERROR),
    });
  };

  if (submitted) {
    return (
      <Alert severity="success" sx={{ mt: 2 }}>
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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : null}
          fullWidth
        >
          {isPending ? UI.password.SENDING : UI.password.SEND_LINK_BUTTON}
        </Button>
      </Stack>
    </Box>
  );
}
