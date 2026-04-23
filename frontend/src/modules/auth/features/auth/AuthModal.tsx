import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { Controller, useForm } from "react-hook-form";

import { UI } from "../../constants/ui";
import { loginSchema } from "./schemas";
import { useLoginMutation } from "./loginMutation";
import type { LoginCredentials } from "./types";
import styles from "./AuthModal.module.scss";

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
    <Container maxWidth="xs" className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
          Hersa
        </Typography>
        {error && (
          <Alert severity="error" className={styles.alert}>
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
