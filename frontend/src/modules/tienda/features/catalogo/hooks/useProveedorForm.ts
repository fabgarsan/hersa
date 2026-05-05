import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { isNetworkError } from "@api/offlineMutationEvents";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { proveedorSchema } from "../schemas";
import { useGetProveedorQuery } from "../api/getProveedorQuery";
import { useCreateProveedorMutation } from "../api/createProveedorMutation";
import { useUpdateProveedorMutation } from "../api/updateProveedorMutation";
import type { ProveedorFormValues, UseProveedorFormReturn } from "../types";

export function useProveedorForm(): UseProveedorFormReturn {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const {
    data: proveedor,
    isLoading: isLoadingProveedor,
    error: errorProveedor,
  } = useGetProveedorQuery(id);

  const { mutate: createProveedor, isPending: isCreating } = useCreateProveedorMutation();
  const { mutate: updateProveedor, isPending: isUpdating } = useUpdateProveedorMutation();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const { control, handleSubmit, reset } = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      name: "",
      contact: "",
    },
  });

  useEffect(() => {
    if (proveedor) {
      reset({
        name: proveedor.name,
        contact: proveedor.contact,
      });
    }
  }, [proveedor, reset]);

  const onSubmit = (values: ProveedorFormValues) => {
    if (isEditMode && id) {
      updateProveedor(
        { id, payload: values },
        {
          onSuccess: () => {
            setSnackbarMessage("Proveedor actualizado correctamente");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            navigate(TIENDA_ROUTES.PROVEEDORES);
          },
          onError: (err) => {
            if (isNetworkError(err)) return;
            setSnackbarMessage("Error al actualizar el proveedor");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          },
        },
      );
    } else {
      createProveedor(values, {
        onSuccess: () => {
          setSnackbarMessage("Proveedor creado correctamente");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          navigate(TIENDA_ROUTES.PROVEEDORES);
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
          setSnackbarMessage("Error al crear el proveedor");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        },
      });
    }
  };

  return {
    control,
    handleSubmit,
    isSubmitting: isCreating || isUpdating,
    isEditMode,
    proveedor,
    isLoadingProveedor,
    errorProveedor,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    onCloseSnackbar: () => setSnackbarOpen(false),
    onSubmit,
  };
}
