import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid2 from "@mui/material/Grid2";
import SchoolIcon from "@mui/icons-material/School";

export default function GradosPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Grados
      </Typography>
      <Grid2 container spacing={3}>
        {[
          "Gestión de ceremonias",
          "Logística del día",
          "Reserva de auditorios",
          "Maestros de ceremonia",
        ].map((item) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={item}>
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                color: "text.secondary",
              }}
            >
              <SchoolIcon sx={{ fontSize: 40, color: "secondary.main" }} />
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
    </Box>
  );
}
