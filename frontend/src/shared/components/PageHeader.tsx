import Breadcrumbs from "@mui/material/Breadcrumbs";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import type { PageHeaderProps } from "./types";
import styles from "./PageHeader.module.scss";

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Stack className={styles.root}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs className={styles.breadcrumbs}>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            if (isLast || !item.href) {
              return (
                <Typography
                  key={item.label}
                  variant="body2"
                  className={isLast ? styles.breadcrumbCurrent : styles.breadcrumbText}
                >
                  {item.label}
                </Typography>
              );
            }
            return (
              <RouterLink key={item.label} to={item.href} className={styles.breadcrumbLink}>
                <Typography variant="body2">{item.label}</Typography>
              </RouterLink>
            );
          })}
        </Breadcrumbs>
      )}
      <Stack className={styles.titleRow}>
        <Stack className={styles.titleGroup}>
          <Typography variant="h5" className={styles.title}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" className={styles.subtitle}>
              {subtitle}
            </Typography>
          )}
        </Stack>
        {actions && <Stack className={styles.actions}>{actions}</Stack>}
      </Stack>
    </Stack>
  );
}
