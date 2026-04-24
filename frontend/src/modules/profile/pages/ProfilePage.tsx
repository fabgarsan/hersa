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
      <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
        Mi perfil
      </Typography>

      <Grid2 container spacing={3} className={styles.grid}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              avatar={<LockIcon color="primary" />}
              title={
                <Typography variant="h6" fontWeight={600}>
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
                <Typography variant="h6" fontWeight={600}>
                  Mi Información
                </Typography>
              }
            />
            <Divider />
            <CardContent className={styles.infoContent}>
              {isLoading ? (
                <List disablePadding>
                  {[0, 1, 2, 3].map((i) => (
                    <ListItem key={i} divider={i < 3}>
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
                    { label: "Nombre", value: user?.first_name || "—" },
                    { label: "Apellido", value: user?.last_name || "—" },
                    { label: "Usuario", value: user?.username || "—" },
                    { label: "Correo", value: user?.email || "—" },
                  ].map(({ label, value }, i) => (
                    <ListItem key={label} divider={i < 3}>
                      <ListItemText
                        primary={label}
                        secondary={value}
                        slotProps={{
                          primary: { variant: "caption", color: "text.secondary" },
                          secondary: { variant: "body2", color: "text.primary" },
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
