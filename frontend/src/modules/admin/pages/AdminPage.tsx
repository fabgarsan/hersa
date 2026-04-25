import Button from "@mui/material/Button";
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

import { ModuleLayout } from "@shared/components";
import { StatCard } from "@modules/admin/components/StatCard";
import { UI } from "@modules/admin/constants/ui";
import type { StatCardData } from "@modules/admin/pages/types";
import styles from "./AdminPage.module.scss";

const STATS: StatCardData[] = [
  {
    label: UI.stats.ACTIVE_USERS_LABEL,
    value: UI.stats.ACTIVE_USERS_VALUE,
    trend: UI.stats.ACTIVE_USERS_TREND,
    trendUp: true,
    icon: <GroupIcon className={styles.statIcon} />,
  },
  {
    label: UI.stats.REGISTERED_SCHOOLS_LABEL,
    value: UI.stats.REGISTERED_SCHOOLS_VALUE,
    trend: UI.stats.REGISTERED_SCHOOLS_TREND,
    trendUp: true,
    icon: <SchoolIcon className={styles.statIcon} />,
  },
  {
    label: UI.stats.CEREMONIES_LABEL,
    value: UI.stats.CEREMONIES_VALUE,
    trend: UI.stats.CEREMONIES_TREND,
    trendUp: false,
    icon: <EventIcon className={styles.statIcon} />,
  },
  {
    label: UI.stats.REVENUE_LABEL,
    value: UI.stats.REVENUE_VALUE,
    trend: UI.stats.REVENUE_TREND,
    trendUp: true,
    icon: <AttachMoneyIcon className={styles.statIcon} />,
  },
];

const actions = (
  <>
    <Button variant="outlined" startIcon={<DownloadIcon />}>
      {UI.actions.EXPORT_REPORT}
    </Button>
    <Button variant="contained" startIcon={<AddIcon />}>
      {UI.actions.NEW_USER}
    </Button>
  </>
);

const footer = (
  <Typography variant="body2" className={styles.footerText}>
    {UI.page.FOOTER}
  </Typography>
);

export default function AdminPage() {
  return (
    <ModuleLayout
      title={UI.page.TITLE}
      subtitle={UI.page.SUBTITLE}
      actions={actions}
      footer={footer}
    >
      <Grid2 container spacing={3}>
        {STATS.map((stat) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <StatCard {...stat} />
          </Grid2>
        ))}

        <Grid2 size={{ xs: 12 }}>
          <Paper variant="outlined" className={styles.activityCard}>
            <Typography variant="subtitle1" className={styles.activityTitle}>
              {UI.activity.SECTION_TITLE}
            </Typography>
            <Divider />
            <List disablePadding>
              {UI.activity.ITEMS.map(({ user, action, time }, i) => (
                <ListItem
                  key={action}
                  divider={i < UI.activity.ITEMS.length - 1}
                  className={styles.activityItem}
                >
                  <ListItemText
                    primary={action}
                    secondary={user}
                    slotProps={{
                      primary: { variant: "body2" },
                      secondary: { variant: "caption" },
                    }}
                  />
                  <Typography
                    variant="caption"
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
