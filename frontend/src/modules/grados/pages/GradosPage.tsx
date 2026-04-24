import Grid2 from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SchoolIcon from "@mui/icons-material/School";

import { ModuleLayout } from "@shared/components";
import styles from "./GradosPage.module.scss";

export default function GradosPage() {
  return (
    <ModuleLayout title="Grados">
      <Grid2 container spacing={3}>
        {[
          "Gestión de ceremonias",
          "Logística del día",
          "Reserva de auditorios",
          "Maestros de ceremonia",
        ].map((item) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={item}>
            <Paper variant="outlined" className={styles.card}>
              <SchoolIcon className={styles.icon} />
              <Typography variant="subtitle1" fontWeight={500} textAlign="center">
                {item}
              </Typography>
              <Typography variant="body2" textAlign="center">
                Próximamente
              </Typography>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </ModuleLayout>
  );
}
