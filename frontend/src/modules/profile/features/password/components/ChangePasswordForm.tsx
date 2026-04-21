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
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { AxiosError } from "axios";

import { UI } from "../../../constants/ui";
import { useChangePasswordMutation } from "../api/changePasswordMutation";
import { changePasswordSchema } from "../schemas";
import type { ChangePasswordFormValues } from "../types";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Controller
          name="currentPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={UI.password.CURRENT_LABEL}
              type={showCurrent ? "text" : "password"}
              error={Boolean(errors.currentPassword)}
              helperText={errors.currentPassword?.message}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrent((v) => !v)} edge="end">
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

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
          sx={{ alignSelf: "flex-start" }}
        >
          {isPending ? UI.password.CHANGING : UI.password.CHANGE_BUTTON}
        </Button>
      </Stack>
    </Box>
  );
}
