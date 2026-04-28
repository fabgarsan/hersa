import { useCallback, useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';

import styles from './ConnectivityIndicator.module.scss';

export type ConnectivityState = 'hidden' | 'offline' | 'reconnected' | 'fadingOut';

const INIT_GUARD_MS = 800;
const RECONNECTED_DISPLAY_MS = 4000;
const FADE_OUT_MS = 250;

// Heights used by the hook below
const INDICATOR_HEIGHT_MOBILE = 32;
const INDICATOR_HEIGHT_DESKTOP = 40;

/**
 * Hook consumed by Layout to add compensating padding-top when the indicator
 * is visible, preventing content from being obscured by the fixed bar.
 *
 * Returns 0 when hidden, 32px on mobile, 40px on desktop when visible.
 */
export function useConnectivityIndicatorHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleChange = (e: CustomEvent<{ visible: boolean }>) => {
      if (!e.detail.visible) {
        setHeight(0);
        return;
      }
      const isDesktop = window.matchMedia(`(min-width: 900px)`).matches;
      setHeight(isDesktop ? INDICATOR_HEIGHT_DESKTOP : INDICATOR_HEIGHT_MOBILE);
    };

    window.addEventListener(
      'connectivity-indicator-visibility',
      handleChange as EventListener,
    );

    return () =>
      window.removeEventListener(
        'connectivity-indicator-visibility',
        handleChange as EventListener,
      );
  }, []);

  return height;
}

export function ConnectivityIndicator() {
  const [state, setState] = useState<ConnectivityState>('hidden');
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches,
  );

  const initDoneRef = useRef(false);
  const offlineEventFiredRef = useRef(false);
  const reconnectedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track desktop breakpoint reactively
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const dispatchVisibility = useCallback((visible: boolean) => {
    window.dispatchEvent(
      new CustomEvent('connectivity-indicator-visibility', { detail: { visible } }),
    );
  }, []);

  const clearReconnectedTimers = useCallback(() => {
    if (reconnectedTimerRef.current !== null) {
      clearTimeout(reconnectedTimerRef.current);
      reconnectedTimerRef.current = null;
    }
    if (fadeOutTimerRef.current !== null) {
      clearTimeout(fadeOutTimerRef.current);
      fadeOutTimerRef.current = null;
    }
  }, []);

  const goOffline = useCallback(() => {
    clearReconnectedTimers();
    offlineEventFiredRef.current = true;
    setState('offline');
    dispatchVisibility(true);
  }, [clearReconnectedTimers, dispatchVisibility]);

  const goOnline = useCallback(() => {
    setState((prev) => {
      // If we were never shown (e.g., first load while online), don't show reconnected banner
      if (prev === 'hidden') return 'hidden';
      return 'reconnected';
    });
    dispatchVisibility(true);

    reconnectedTimerRef.current = setTimeout(() => {
      setState('fadingOut');
      fadeOutTimerRef.current = setTimeout(() => {
        setState('hidden');
        dispatchVisibility(false);
      }, FADE_OUT_MS);
    }, RECONNECTED_DISPLAY_MS);
  }, [dispatchVisibility]);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      initDoneRef.current = true;
      // After guard: if we are offline and no explicit event fired, honour navigator state
      if (!navigator.onLine && !offlineEventFiredRef.current) {
        goOffline();
      }
    }, INIT_GUARD_MS);

    const handleOffline = () => {
      // Explicit offline event bypasses the init guard
      goOffline();
    };

    const handleOnline = () => {
      clearReconnectedTimers();
      goOnline();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(initTimer);
      clearReconnectedTimers();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [goOffline, goOnline, clearReconnectedTimers]);

  if (state === 'hidden') {
    return null;
  }

  const isOffline = state === 'offline';
  const isFadingOut = state === 'fadingOut';

  const rootClass = [
    styles.root,
    isOffline ? styles.rootOffline : styles.rootReconnected,
    isFadingOut ? styles.rootFadingOut : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Estado de conectividad"
      className={rootClass}
    >
      {isOffline ? (
        <WifiOffIcon className={styles.icon} aria-label="Sin conexión" aria-hidden={false} />
      ) : (
        <WifiIcon
          className={styles.icon}
          aria-label="Conexión restaurada"
          aria-hidden={false}
        />
      )}

      <Typography
        variant={isDesktop && isOffline ? 'body2' : 'caption'}
        component="span"
        className={styles.text}
      >
        {isOffline
          ? isDesktop
            ? 'Sin conexión — los datos pueden no estar actualizados'
            : 'Sin señal'
          : 'Conexión restaurada'}
      </Typography>
    </div>
  );
}
