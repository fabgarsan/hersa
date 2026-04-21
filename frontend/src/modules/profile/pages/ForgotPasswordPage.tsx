import { Box, Card, CardContent, Container, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { ROUTES } from "@shared/constants/routes";
import { UI } from "../constants/ui";
import { ForgotPasswordForm } from "../features/password";

export default function ForgotPasswordPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Card variant="outlined">
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" fontWeight={600} color="primary" gutterBottom>
              {UI.pages.forgotPassword.TITLE}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {UI.pages.forgotPassword.SUBTITLE}
            </Typography>

            <ForgotPasswordForm />

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Link component={RouterLink} to={ROUTES.HOME} variant="body2" color="primary">
                {UI.pages.forgotPassword.BACK_TO_LOGIN}
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
