import { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import CloseIcon from '@mui/icons-material/Close';

import type { OfflineSnackbarProps } from './types';
import styles from './OfflineSnackbar.module.scss';

export function OfflineSnackbar({ open, onClose }: OfflineSnackbarProps) {
  // Switch anchor origin at the md breakpoint (900px)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const anchorOrigin = {
    vertical: 'bottom' as const,
    horizontal: isDesktop ? ('right' as const) : ('center' as const),
  };

  const messageNode = (
    <span className={styles.messageWrapper}>
      <WifiOffIcon className={styles.icon} aria-hidden="true" />
      <span className={styles.textBlock}>
        <Typography variant="body2" component="span" className={styles.line1}>
          No se pudo guardar
        </Typography>
        <Typography variant="body2" component="span" className={styles.line2}>
          Sin conexión. Vuelve a intentarlo cuando recuperes la señal.
        </Typography>
      </span>
    </span>
  );

  const closeAction = (
    <IconButton
      size="small"
      aria-label="Cerrar notificación"
      onClick={onClose}
      className={styles.closeButton}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <SnackbarContent
        className={styles.snackbarContent}
        message={messageNode}
        action={closeAction}
      />
    </Snackbar>
  );
}
