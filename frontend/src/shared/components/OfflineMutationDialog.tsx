import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import WifiOffIcon from '@mui/icons-material/WifiOff';

import type { OfflineMutationDialogProps } from './types';
import styles from './OfflineMutationDialog.module.scss';

export function OfflineMutationDialog({ open, onClose }: OfflineMutationDialogProps) {
  return (
    <Dialog
      open={open}
      // User must acknowledge via button — no Escape key escape, no backdrop click
      disableEscapeKeyDown
      // Omitting onClose intentionally: clicking backdrop does nothing
      PaperProps={{ className: styles.dialogPaper }}
      aria-labelledby="offline-mutation-dialog-title"
    >
      <DialogContent className={styles.content}>
        <div className={styles.iconWrapper}>
          {/*
           * Icon colour: $primary-main navy — NOT error red.
           * Rationale: Dialog already appears in an error context; navy is formal
           * without amplifying alarm for field staff under ceremony pressure.
           * (per UI spec §3.3 icon colour rationale)
           */}
          <WifiOffIcon className={styles.wifiIcon} aria-hidden="true" />
        </div>

        <Typography
          variant="h3"
          align="center"
          id="offline-mutation-dialog-title"
          className={styles.title}
        >
          El cambio no se guardó
        </Typography>

        <Typography variant="body1" align="center" className={styles.body}>
          No hay conexión en este momento. Los datos no fueron enviados. Cuando recuperes la
          señal, intenta guardar de nuevo.
        </Typography>
      </DialogContent>

      <DialogActions className={styles.actions} disableSpacing>
        {/*
         * size="large" → 48px height, satisfying the 44px touch target minimum.
         * autoFocus: focus moves here immediately on Dialog open (per UI spec §5.4).
         */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          autoFocus
          onClick={onClose}
        >
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
}
