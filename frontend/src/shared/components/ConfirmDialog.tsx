import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import type { ConfirmDialogProps } from "./types";
import styles from "./ConfirmDialog.module.scss";

const SEVERITY_COLOR_MAP = {
  warning: "warning",
  error: "error",
  info: "primary",
} as const;

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  severity = "warning",
  loading = false,
}: ConfirmDialogProps) {
  const confirmColor = SEVERITY_COLOR_MAP[severity];

  return (
    <Dialog open={open} onClose={onCancel} className={styles.dialog}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
          className={styles.confirmButton}
        >
          {loading ? (
            <CircularProgress size={16} className={styles.spinner} />
          ) : (
            confirmLabel
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
