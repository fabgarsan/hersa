import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";

import { AuthPageCard } from "@shared/components";
import { ROUTES } from "@shared/constants/routes";
import { UI } from "../constants/ui";
import { ForgotPasswordForm } from "../features/password";
import styles from "./ForgotPasswordPage.module.scss";

export default function ForgotPasswordPage() {
  const footer = (
    <Link component={RouterLink} to={ROUTES.LOGIN} variant="body2" color="primary">
      {UI.pages.forgotPassword.BACK_TO_LOGIN}
    </Link>
  );

  return (
    <div className={styles.root}>
      <AuthPageCard
        title={UI.pages.forgotPassword.TITLE}
        subtitle={UI.pages.forgotPassword.SUBTITLE}
        footer={footer}
      >
        <ForgotPasswordForm />
      </AuthPageCard>
    </div>
  );
}
