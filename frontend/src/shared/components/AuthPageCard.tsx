import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import type { AuthPageCardProps } from "./types";
import styles from "./AuthPageCard.module.scss";

export function AuthPageCard({ title, subtitle, footer, children }: AuthPageCardProps) {
  return (
    <Box className={styles.pageRoot}>
      <Container maxWidth="xs">
        <Card variant="outlined">
          <CardContent className={styles.cardContent}>
            <Typography variant="h5" fontWeight={600} color="primary" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" className={styles.subtitle}>
                {subtitle}
              </Typography>
            )}

            {children}

            {footer && <Box className={styles.footer}>{footer}</Box>}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
