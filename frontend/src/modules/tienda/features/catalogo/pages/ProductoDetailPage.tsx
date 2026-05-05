import { useParams, useNavigate, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";

import { ErrorState, LoadingState, PageHeader } from "@shared/components";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { ReadOnlyBadge } from "@modules/tienda/shared/components/ReadOnlyBadge";
import { useGetProductoQuery } from "../api/getProductoQuery";
import { ProveedorPanel } from "../components/ProveedorPanel";
import styles from "./ProductoDetailPage.module.scss";

export default function ProductoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, role } = useTiendaRole();

  const { data: producto, isLoading, isError } = useGetProductoQuery(id);

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (isLoading) {
    return <LoadingState variant="skeleton" rows={2} />;
  }

  if (isError || !producto) {
    return <ErrorState title="Error al cargar el producto" description="Intenta nuevamente." />;
  }

  return (
    <Box className={styles.root}>
      <PageHeader
        title={producto.name}
        breadcrumbs={[
          { label: "Tienda", href: "/tienda" },
          { label: "Productos", href: "/tienda/productos" },
          { label: producto.name },
        ]}
        actions={
          isAdmin ? (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/tienda/productos/${producto.id}/editar`)}
            >
              Editar
            </Button>
          ) : undefined
        }
      />

      <Card elevation={0} className={styles.card}>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" className={styles.fieldLabel}>
                Descripción
              </Typography>
              <Typography variant="body1">
                {producto.description || <em>Sin descripción</em>}
              </Typography>
            </Box>

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {isAdmin && (
                <ReadOnlyBadge label="Precio de venta" value={`$${producto.salePrice}`} />
              )}
              {isAdmin && <ReadOnlyBadge label="Costo promedio" value={`$${producto.avgCost}`} />}
              <Box>
                <Typography variant="caption" className={styles.fieldLabel}>
                  Estado
                </Typography>
                <Box>
                  <Chip
                    label={producto.isActive ? "Activo" : "Inactivo"}
                    color={producto.isActive ? "success" : "default"}
                    size="small"
                  />
                </Box>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box className={styles.proveedorSection}>
        <ProveedorPanel
          productoId={producto.id}
          suppliers={producto.suppliers ?? []}
          isAdmin={isAdmin}
        />
      </Box>
    </Box>
  );
}
