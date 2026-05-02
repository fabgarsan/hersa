import type { ReactNode } from "react";

import InboxIcon from "@mui/icons-material/Inbox";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import type { EmptyStateProps } from "./types";
import styles from "./EmptyState.module.scss";

const VARIANT_DEFAULTS: Record<
  NonNullable<EmptyStateProps["variant"]>,
  { title: string; description: string }
> = {
  initial: {
    title: "Aún no hay registros",
    description: "Cuando agregues el primero aparecerá aquí.",
  },
  filtered: {
    title: "Sin resultados",
    description: "Intentá con otros filtros o términos de búsqueda.",
  },
  permission: {
    title: "Acceso restringido",
    description: "No tenés permisos para ver este contenido.",
  },
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = "initial",
}: EmptyStateProps) {
  const defaults = VARIANT_DEFAULTS[variant];
  const resolvedTitle = title ?? defaults.title;
  const resolvedDescription = description ?? defaults.description;
  const resolvedIcon: ReactNode = icon ?? <InboxIcon className={styles.icon} />;

  return (
    <Box className={styles.root}>
      <Box className={styles.iconWrapper}>{resolvedIcon}</Box>
      <Typography variant="h6" className={styles.title}>
        {resolvedTitle}
      </Typography>
      {resolvedDescription && (
        <Typography variant="body2" className={styles.description}>
          {resolvedDescription}
        </Typography>
      )}
      {action && <Box className={styles.action}>{action}</Box>}
    </Box>
  );
}
