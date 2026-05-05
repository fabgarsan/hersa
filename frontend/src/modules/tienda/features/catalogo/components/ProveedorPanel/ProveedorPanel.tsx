import { useState } from "react";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";

import { isNetworkError } from "@api/offlineMutationEvents";
import { useGetProveedoresQuery } from "../../api/getProveedoresQuery";
import { useAssociateProveedorMutation } from "../../api/associateProveedorMutation";
import { useRemoveProveedorMutation } from "../../api/removeProveedorMutation";
import type { Supplier } from "../../types";
import type { ProveedorPanelProps } from "./types";
import styles from "./ProveedorPanel.module.scss";

export function ProveedorPanel({ productoId, suppliers, isAdmin }: ProveedorPanelProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const { data: proveedoresData, isLoading: isLoadingProveedores } = useGetProveedoresQuery(
    {
      pageSize: 200,
    },
    isAdmin,
  );

  const { mutate: associateProveedor, isPending: isAssociating } = useAssociateProveedorMutation();
  const { mutate: removeProveedor, isPending: isRemoving } = useRemoveProveedorMutation();

  const allProveedores = proveedoresData?.results ?? [];
  const associatedIds = new Set(suppliers.map((s) => s.id));
  const availableProveedores = allProveedores.filter((p) => !associatedIds.has(p.id));

  const handleAdd = () => {
    if (!selectedSupplier) return;
    setAddError(null);
    associateProveedor(
      { productoId, supplierId: selectedSupplier.id },
      {
        onSuccess: () => setSelectedSupplier(null),
        onError: (err) => {
          if (isNetworkError(err)) return;
          setAddError("Error al asociar el proveedor. Intenta nuevamente.");
        },
      },
    );
  };

  const handleRemove = (supplierId: string) => {
    removeProveedor({ productoId, supplierId });
  };

  return (
    <Box className={styles.root}>
      <Typography variant="h6" className={styles.title}>
        Proveedores asociados
      </Typography>
      <Divider className={styles.divider} />

      {suppliers.length === 0 ? (
        <Typography variant="body2" className={styles.empty}>
          Sin proveedores asociados.
        </Typography>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={1} className={styles.chipList}>
          {suppliers.map((supplier) => (
            <Chip
              key={supplier.id}
              label={supplier.name}
              onDelete={isAdmin ? () => handleRemove(supplier.id) : undefined}
              disabled={isRemoving}
              variant="outlined"
            />
          ))}
        </Stack>
      )}

      {isAdmin && (
        <Box className={styles.addSection}>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Autocomplete
              options={availableProveedores}
              getOptionLabel={(option) => option.name}
              value={selectedSupplier}
              onChange={(_event, newValue) => {
                setSelectedSupplier(newValue);
                setAddError(null);
              }}
              loading={isLoadingProveedores}
              className={styles.autocomplete}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Agregar proveedor"
                  size="small"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingProveedores ? (
                            <CircularProgress color="inherit" size={16} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={!selectedSupplier || isAssociating}
              className={styles.addButton}
            >
              {isAssociating ? "Agregando..." : "Agregar"}
            </Button>
          </Stack>
          {addError && (
            <Alert severity="error" className={styles.addError}>
              {addError}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
