import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { ROUTES } from "@shared/constants/routes";
import { UI } from "../constants/ui";
import { ResetPasswordForm } from "../features/password";
import styles from "./ResetPasswordPage.module.scss";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const isValidLink = uid.length > 0 && token.length > 0;

  return (
    <Box className={styles.pageRoot}>
      <Container maxWidth="xs">
        <Card variant="outlined">
          <CardContent className={styles.cardContent}>
            <Typography variant="h5" fontWeight={600} color="primary" gutterBottom>
              {UI.pages.resetPassword.TITLE}
            </Typography>

            {isValidLink ? (
              <ResetPasswordForm uid={uid} token={token} />
            ) : (
              <Box>
                <Typography color="error" className={styles.invalidLinkMessage}>
                  {UI.pages.resetPassword.INVALID_LINK}
                </Typography>
                <Link
                  component={RouterLink}
                  to={ROUTES.FORGOT_PASSWORD}
                  variant="body2"
                  color="primary"
                >
                  {UI.pages.resetPassword.REQUEST_NEW_LINK}
                </Link>
              </Box>
            )}

            <Box className={styles.footer}>
              <Link component={RouterLink} to={ROUTES.HOME} variant="body2" color="primary">
                {UI.pages.resetPassword.BACK_TO_LOGIN}
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
