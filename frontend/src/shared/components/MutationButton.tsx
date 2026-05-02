import WifiOffIcon from "@mui/icons-material/WifiOff";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";

import { useOnlineStatus } from "@shared/hooks";
import type { MutationButtonProps } from "./types";
import styles from "./MutationButton.module.scss";

export function MutationButton({
  isPending,
  label,
  pendingLabel,
  fullWidth,
  hasPermission,
  unauthorizedBehavior = "hidden",
  unauthorizedTooltip,
}: MutationButtonProps) {
  const isOnline = useOnlineStatus();

  const isUnauthorized = hasPermission === false;

  if (isUnauthorized && unauthorizedBehavior === "hidden") {
    return null;
  }

  const isDisabled = isPending || !isOnline || isUnauthorized;
  const currentLabel = isPending ? pendingLabel : isOnline ? label : "Sin conexión";
  const startIcon = isPending ? (
    <CircularProgress size={20} color="inherit" />
  ) : isOnline ? null : (
    <WifiOffIcon fontSize="small" />
  );

  const button = (
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
  );

  if (isUnauthorized && unauthorizedTooltip) {
    return (
      <Tooltip title={unauthorizedTooltip} arrow>
        <span className={styles.tooltipWrapper}>{button}</span>
      </Tooltip>
    );
  }

  return <span className={styles.root}>{button}</span>;
}
