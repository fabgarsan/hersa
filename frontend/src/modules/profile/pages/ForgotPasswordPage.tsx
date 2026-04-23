import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import { ROUTES } from "@shared/constants/routes";
import { UI } from "../constants/ui";
import { ForgotPasswordForm } from "../features/password";
import styles from "./ForgotPasswordPage.module.scss";

export default function ForgotPasswordPage() {
  return (
    <Box className={styles.pageRoot}>
      <Container maxWidth="xs">
        <Card variant="outlined">
          <CardContent className={styles.cardContent}>
            <Typography variant="h5" fontWeight={600} color="primary" gutterBottom>
              {UI.pages.forgotPassword.TITLE}
            </Typography>
            <Typography variant="body2" color="text.secondary" className={styles.subtitle}>
              {UI.pages.forgotPassword.SUBTITLE}
            </Typography>

            <ForgotPasswordForm />

            <Box className={styles.footer}>
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
