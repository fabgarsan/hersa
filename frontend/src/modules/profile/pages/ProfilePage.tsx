import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid2 from "@mui/material/Grid2";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

import { useMeQuery } from "@modules/auth";
import { ChangePasswordForm } from "../features/password";
import styles from "./ProfilePage.module.scss";

export default function ProfilePage() {
  const { data: user, isLoading } = useMeQuery();

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Typography variant="h5" className={styles.pageTitle}>
        Mi perfil
      </Typography>

      <Grid2 container spacing={3} className={styles.grid}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              avatar={<LockIcon color="primary" />}
              title={
                <Typography variant="h6" className={styles.cardSectionTitle}>
                  Cambiar contraseña
                </Typography>
              }
            />
            <Divider />
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              avatar={<PersonIcon color="primary" />}
              title={
                <Typography variant="h6" className={styles.cardSectionTitle}>
                  Mi información
                </Typography>
              }
            />
            <Divider />
            <CardContent className={styles.infoContent}>
              {isLoading ? (
                <List disablePadding data-testid="profile-skeleton-list">
                  {[0, 1, 2, 3].map((i) => (
                    <ListItem key={`skeleton-field-${i}`} divider={i < 3}>
                      <ListItemText
                        primary={<Skeleton width={80} />}
                        secondary={<Skeleton width={160} />}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <List disablePadding>
                  {[
                    { label: "Nombre", value: user?.firstName || "—" },
                    { label: "Apellido", value: user?.lastName || "—" },
                    { label: "Usuario", value: user?.username || "—" },
                    { label: "Correo", value: user?.email || "—" },
                  ].map(({ label, value }, i) => (
                    <ListItem key={label} divider={i < 3}>
                      <ListItemText
                        primary={label}
                        secondary={value}
                        slotProps={{
                          primary: { variant: "caption", className: styles.fieldLabel },
                          secondary: { variant: "body2", className: styles.fieldValue },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Container>
  );
}
