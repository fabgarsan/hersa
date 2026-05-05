import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import type { AlertaCajaAlertProps } from "./types";
import styles from "./AlertaCajaAlert.module.scss";

export function AlertaCajaAlert({ cashAlert }: AlertaCajaAlertProps) {
  if (!cashAlert) return null;

  return (
    <Alert severity="warning" className={styles.root}>
      <AlertTitle>Alerta de caja</AlertTitle>
      {cashAlert}
    </Alert>
  );
}
