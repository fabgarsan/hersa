import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid2,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

import { ChangePasswordForm } from "../features/password";

export default function ProfilePage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
        Mi perfil
      </Typography>

      <Grid2 container spacing={3} sx={{ mt: 1 }}>
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
                  Editar perfil
                </Typography>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  Edición de perfil próximamente.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Container>
  );
}
