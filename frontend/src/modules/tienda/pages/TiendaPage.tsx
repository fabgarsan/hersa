import { Box, Typography, Paper, Grid } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";

export default function TiendaPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Tienda
      </Typography>
      <Grid container spacing={3}>
        {["Togas y accesorios", "Diplomas", "Paquetes fotográficos", "Recuerdos"].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
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
              <StorefrontIcon sx={{ fontSize: 40, color: "secondary.main" }} />
              <Typography variant="subtitle1" fontWeight={500} textAlign="center">
                {item}
              </Typography>
              <Typography variant="body2" textAlign="center">
                Próximamente
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
