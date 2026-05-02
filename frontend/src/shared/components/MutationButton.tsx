import WifiOffIcon from "@mui/icons-material/WifiOff";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { useOnlineStatus } from "@shared/hooks";
import type { MutationButtonProps } from "./types";
import styles from "./MutationButton.module.scss";

export function MutationButton({
  isPending,
  label,
  pendingLabel,
  fullWidth,
  disabled,
}: MutationButtonProps) {
  const isOnline = useOnlineStatus();

  const isDisabled = isPending || !isOnline || disabled;
  const currentLabel = isPending ? pendingLabel : isOnline ? label : "Sin conexión";
  const startIcon = isPending ? (
    <CircularProgress size={20} color="inherit" />
  ) : isOnline ? null : (
    <WifiOffIcon fontSize="small" />
  );

  return (
    <span className={styles.root}>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isDisabled}
        startIcon={startIcon}
        fullWidth={fullWidth}
      >
        {currentLabel}
      </Button>
    </span>
  );
}
