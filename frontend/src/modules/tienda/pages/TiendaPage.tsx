import Box from "@mui/material/Box";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import StorefrontIcon from "@mui/icons-material/Storefront";

export default function TiendaPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Tienda
      </Typography>
      <Grid2 container spacing={3}>
        {["Togas y accesorios", "Diplomas", "Paquetes fotográficos", "Recuerdos"].map((item) => (
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
              <StorefrontIcon sx={{ fontSize: 40, color: "secondary.main" }} />
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
