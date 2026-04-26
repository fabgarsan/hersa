import { useEffect } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { AuthPageCard } from "@shared/components";
import { ROUTES } from "@shared/constants/routes";
import { UI } from "../constants/ui";
import { ResetPasswordForm } from "../features/password";
import styles from "./ResetPasswordPage.module.scss";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  // Intentionally runs only on mount: strip sensitive params from URL history.
  // uid and token are already captured above; the form continues working after cleanup.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (uid && token) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const isValidLink = uid.length > 0 && token.length > 0;

  const footer = (
    <Link component={RouterLink} to={ROUTES.HOME} variant="body2" color="primary">
      {UI.pages.resetPassword.BACK_TO_LOGIN}
    </Link>
  );

  return (
    <AuthPageCard title={UI.pages.resetPassword.TITLE} footer={footer}>
      {isValidLink ? (
        <ResetPasswordForm uid={uid} token={token} />
      ) : (
        <Box>
          <Typography color="error" className={styles.invalidLinkMessage}>
            {UI.pages.resetPassword.INVALID_LINK}
          </Typography>
          <Link component={RouterLink} to={ROUTES.FORGOT_PASSWORD} variant="body2" color="primary">
            {UI.pages.resetPassword.REQUEST_NEW_LINK}
          </Link>
        </Box>
      )}
    </AuthPageCard>
  );
}
