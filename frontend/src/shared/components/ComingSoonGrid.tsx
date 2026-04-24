import Grid2 from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import type { ComingSoonGridProps } from "./types";
import styles from "./ComingSoonGrid.module.scss";

export function ComingSoonGrid({ items }: ComingSoonGridProps) {
  return (
    <Grid2 container spacing={3}>
      {items.map(({ label, description, icon }) => (
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={label}>
          <Paper variant="outlined" className={styles.card}>
            <span className={styles.iconWrapper}>{icon}</span>
            <Typography variant="subtitle1" fontWeight={500} textAlign="center">
              {label}
            </Typography>
            <Typography variant="body2" textAlign="center">
              {description ?? "Próximamente"}
            </Typography>
          </Paper>
        </Grid2>
      ))}
    </Grid2>
  );
}
