import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { FormSectionProps } from "./types";
import styles from "./FormSection.module.scss";

export function FormSection({
  title,
  subtitle,
  children,
  divider = true,
}: FormSectionProps) {
  return (
    <Stack className={styles.root}>
      <Stack className={styles.header}>
        <Typography variant="subtitle2">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" className={styles.subtitle}>
            {subtitle}
          </Typography>
        )}
      </Stack>
      {divider && <Divider className={styles.divider} />}
      <Stack spacing={2}>{children}</Stack>
    </Stack>
  );
}
