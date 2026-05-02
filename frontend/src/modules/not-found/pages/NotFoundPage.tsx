import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SearchOffIcon from "@mui/icons-material/SearchOff";

import { ROUTES } from "@shared/constants/routes";
import type { NotFoundPageProps } from "./types";
import styles from "./NotFoundPage.module.scss";

export default function NotFoundPage({ fullPage = false }: NotFoundPageProps) {
  const navigate = useNavigate();
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const canGoBack = window.history.length > 1;

  useEffect(() => {
    const previous = document.title;
    document.title = "404 - Página no encontrada | Hersa";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    headlineRef.current?.focus();
  }, []);

  if (fullPage) {
    return (
      <Box
        component="main"
        className={styles.pageWrapper}
        role="main"
        aria-label="Página no encontrada"
      >
        <Box className={styles.contentColumn}>
          <SearchOffIcon className={styles.iconFullPage} aria-hidden="true" />

          <Typography
            component="p"
            className={styles.errorCode}
            aria-label="Error 404: página no encontrada"
          >
            404
          </Typography>

          <Typography
            variant="h4"
            component="h1"
            id="not-found-headline"
            ref={headlineRef}
            tabIndex={-1}
            className={styles.headline}
          >
            Página no encontrada
          </Typography>

          <Typography variant="body1" className={styles.description}>
            La dirección que ingresaste no existe o fue movida. Verificá el enlace e intentá de
            nuevo.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} className={styles.ctaGroup}>
            <Button
              variant="contained"
              color="secondary"
              className={styles.ctaButton}
              onClick={() => navigate(ROUTES.HOME)}
              fullWidth
            >
              Volver al inicio
            </Button>

            {canGoBack && (
              <Button
                variant="outlined"
                color="inherit"
                className={styles.ctaButton}
                onClick={() => navigate(-1)}
                fullWidth
              >
                Volver
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="section"
      className={styles.centeringWrapper}
      aria-labelledby="not-found-headline"
    >
      <Paper elevation={0} className={styles.card} component="div">
        <SearchOffIcon className={styles.iconInLayout} aria-hidden="true" />

        <Typography
          component="p"
          className={styles.errorCode}
          aria-label="Error 404: página no encontrada"
        >
          404
        </Typography>

        <Typography
          variant="h4"
          component="h2"
          id="not-found-headline"
          ref={headlineRef}
          tabIndex={-1}
          className={styles.headline}
        >
          Página no encontrada
        </Typography>

        <Typography variant="body1" className={`${styles.description} ${styles.descriptionMuted}`}>
          Esta sección no existe o no tenés acceso. Usá el menú lateral para navegar.
        </Typography>

        <Stack direction="row" spacing={2} className={styles.ctaGroup}>
          <Button
            variant="contained"
            color="secondary"
            className={styles.ctaButton}
            onClick={() => navigate(ROUTES.HOME)}
            fullWidth
          >
            Volver al inicio
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
