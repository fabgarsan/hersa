import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "@shared/constants/routes";
import { UI } from "../../../constants/ui";
import { useResetPasswordMutation } from "../api/resetPasswordMutation";
import { resetPasswordSchema } from "../schemas";
import type { ResetPasswordFormValues } from "../types";

interface ResetPasswordFormProps {
  uid: string;
  token: string;
}

export function ResetPasswordForm({ uid, token }: ResetPasswordFormProps) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
        <Alert severity="success" sx={{ width: "100%" }}>
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
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
            >
              {UI.password.REQUEST_NEW_LINK}
            </Typography>
          </Stack>
        )}

        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={UI.password.NEW_LABEL}
              type={showNew ? "text" : "password"}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword?.message}
              fullWidth
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew((v) => !v)} edge="end">
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={UI.password.CONFIRM_LABEL}
              type={showConfirm ? "text" : "password"}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
          {isPending ? UI.password.RESETTING : UI.password.RESET_BUTTON}
        </Button>
      </Stack>
    </Box>
  );
}
