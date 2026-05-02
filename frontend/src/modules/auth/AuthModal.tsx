import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import MuiLink from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import { isNetworkError } from "@api/offlineMutationEvents";
import { useAuthContext } from "@shared/contexts";
import { MutationButton } from "@shared/components";
import { ROUTES } from "@shared/constants/routes";
import logoHersa from "@shared/assets/logo-hersa.png";
import { UI } from "./constants/ui";
import { useLoginMutation } from "./loginMutation";
import { loginSchema } from "./schemas";
import type { LoginCredentials } from "./types";
import styles from "./AuthModal.module.scss";

export function AuthModal() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? ROUTES.HOME;
  const [hasAuthError, setHasAuthError] = useState(false);

  const { mutate, isPending } = useLoginMutation();

  const { control, handleSubmit } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (values: LoginCredentials) => {
    setHasAuthError(false);
    mutate(values, {
      onSuccess: ({ access, refresh }) => {
        login(access, refresh);
        navigate(redirectTo, { replace: true });
      },
      onError: (err) => {
        if (isNetworkError(err)) return;
        setHasAuthError(true);
      },
    });
  };

  return (
    <Container maxWidth="xs" className={styles.container}>
      <Paper elevation={0} className={styles.paper}>
        <Box className={styles.logoWrapper}>
          <img src={logoHersa} alt="Eventos Hersa" className={styles.logo} />
        </Box>
        {hasAuthError && (
          <Alert severity="error" className={styles.alert}>
            {UI.auth.WRONG_CREDENTIALS}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Controller
            name="username"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={UI.auth.USERNAME_LABEL}
                autoFocus
                fullWidth
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
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <MutationButton
            isPending={isPending}
            label={UI.auth.LOGIN_BUTTON}
            pendingLabel={UI.auth.LOGGING_IN}
            fullWidth
          />
          <MuiLink
            component={RouterLink}
            to={ROUTES.FORGOT_PASSWORD}
            variant="body2"
            className={styles.forgotLink}
          >
            {UI.auth.FORGOT_PASSWORD_LINK}
          </MuiLink>
        </Box>
      </Paper>
    </Container>
  );
}
