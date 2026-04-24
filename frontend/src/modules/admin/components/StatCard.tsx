import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import type { StatCard as StatCardData } from "../pages/types";
import styles from "./StatCard.module.scss";

export function StatCard({ label, value, trend, trendUp, icon }: StatCardData) {
  return (
    <Paper variant="outlined" className={styles.statCard}>
      {icon}
      <Typography variant="h4" fontWeight={700} className={styles.statValue}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Chip
        size="small"
        icon={trendUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
        label={trend}
        className={trendUp ? styles.chipUp : styles.chipDown}
      />
    </Paper>
  );
}
