import Grid2 from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { ModuleLayout } from "@shared/components";
import styles from "./TiendaPage.module.scss";

export default function TiendaPage() {
  return (
    <ModuleLayout title="Tienda">
      <Grid2 container spacing={3}>
        {["Togas y accesorios", "Diplomas", "Paquetes fotográficos", "Recuerdos"].map((item) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={item}>
            <Paper variant="outlined" className={styles.card}>
              <StorefrontIcon className={styles.icon} />
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
