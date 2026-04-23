import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useLoginMutation } from "./loginMutation";

export function AuthModal() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending, error } = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ username, password }, { onSuccess: () => window.location.reload() });
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 12 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
          Hersa
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid credentials. Please try again.
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" size="large" disabled={isPending}>
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
