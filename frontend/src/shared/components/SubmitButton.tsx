import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import type { SubmitButtonProps } from "./types";
import styles from "./SubmitButton.module.scss";

export function SubmitButton({ isPending, label, pendingLabel, fullWidth }: SubmitButtonProps) {
  return (
    <span className={styles.root}>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isPending}
        startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : null}
        fullWidth={fullWidth}
      >
        {isPending ? pendingLabel : label}
      </Button>
    </span>
  );
}
