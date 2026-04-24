import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid2 from "@mui/material/Grid2";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DownloadIcon from "@mui/icons-material/Download";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { ModuleLayout } from "@shared/components";
import styles from "./AdminPage.module.scss";
import { StatCard } from "@modules/admin/pages/types.ts";

const STATS: StatCard[] = [
  {
    label: "Usuarios activos",
    value: "4",
    trend: "+1 este mes",
    trendUp: true,
    icon: <GroupIcon className={styles.statIcon} />,
  },
  {
    label: "Colegios registrados",
    value: "12",
    trend: "+3 este año",
    trendUp: true,
    icon: <SchoolIcon className={styles.statIcon} />,
  },
  {
    label: "Ceremonias este mes",
    value: "3",
    trend: "−1 vs mes anterior",
    trendUp: false,
    icon: <EventIcon className={styles.statIcon} />,
  },
  {
    label: "Ingresos estimados",
    value: "$48.200",
    trend: "+12% este mes",
    trendUp: true,
    icon: <AttachMoneyIcon className={styles.statIcon} />,
  },
];

const RECENT_ACTIVITY = [
  { user: "Carlos Méndez", action: "Actualizó paquete fotográfico", time: "Hace 10 min" },
  { user: "Ana Torres", action: "Registró nuevo colegio: IED La Salle", time: "Hace 1 hora" },
  { user: "Pedro Ruiz", action: "Generó reporte de grados 2025", time: "Hace 3 horas" },
  { user: "Lucía Vargas", action: "Modificó configuración de toga talla M", time: "Ayer, 16:42" },
  { user: "Carlos Méndez", action: "Cerró ceremonia Colegio San Jorge", time: "Ayer, 11:15" },
];

const actions = (
  <>
    <Button variant="outlined" startIcon={<DownloadIcon />}>
      Exportar reporte
    </Button>
    <Button variant="contained" startIcon={<AddIcon />}>
      Nuevo usuario
    </Button>
  </>
);

const footer = (
  <Typography variant="body2" color="text.secondary">
    4 usuarios activos · 12 colegios registrados · Última sincronización: hace 5 minutos
  </Typography>
);

export default function AdminPage() {
  return (
    <ModuleLayout
      title="Administración"
      subtitle="Panel de control del sistema y configuración global"
      actions={actions}
      footer={footer}
    >
      <Grid2 container spacing={3}>
        {STATS.map(({ label, value, trend, trendUp, icon }) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={label}>
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
          </Grid2>
        ))}

        <Grid2 size={{ xs: 12 }}>
          <Paper variant="outlined" className={styles.activityCard}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Actividad reciente
            </Typography>
            <Divider />
            <List disablePadding>
              {RECENT_ACTIVITY.map(({ user, action, time }, i) => (
                <ListItem
                  key={action}
                  divider={i < RECENT_ACTIVITY.length - 1}
                  className={styles.activityItem}
                >
                  <ListItemText
                    primary={action}
                    secondary={user}
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    className={styles.activityTime}
                  >
                    {time}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid2>
      </Grid2>
    </ModuleLayout>
  );
}
