import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Container, Paper, TextField, Typography, Alert } from "@mui/material";
import { Controller, useForm } from "react-hook-form";

import { UI } from "../../constants/ui";
import { loginSchema } from "./schemas";
import { useLoginMutation } from "./loginMutation";
import type { LoginCredentials } from "./types";

export function AuthModal() {
  const { mutate, isPending, error } = useLoginMutation();

  const { control, handleSubmit } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (values: LoginCredentials) => {
    mutate(values, { onSuccess: () => window.location.reload() });
  };

  return (
    <Container maxWidth="xs" sx={{ mt: { xs: 6, sm: 12 } }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
          Hersa
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {UI.auth.WRONG_CREDENTIALS}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Controller
            name="username"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={UI.auth.USERNAME_LABEL}
                autoFocus
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={UI.auth.PASSWORD_LABEL}
                type="password"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Button type="submit" variant="contained" size="large" disabled={isPending}>
            {isPending ? UI.auth.LOGGING_IN : UI.auth.LOGIN_BUTTON}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
