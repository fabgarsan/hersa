import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { isNetworkError } from "@api/offlineMutationEvents";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { productoSchema } from "../schemas";
import { useGetProductoQuery } from "../api/getProductoQuery";
import { useCreateProductoMutation } from "../api/createProductoMutation";
import { useUpdateProductoMutation } from "../api/updateProductoMutation";
import type { ProductoFormValues, UseProductoFormReturn } from "../types";

export function useProductoForm(): UseProductoFormReturn {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const {
    data: producto,
    isLoading: isLoadingProducto,
    error: errorProducto,
  } = useGetProductoQuery(id);

  const { mutate: createProducto, isPending: isCreating } = useCreateProductoMutation();
  const { mutate: updateProducto, isPending: isUpdating } = useUpdateProductoMutation();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const { control, handleSubmit, reset } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      name: "",
      description: "",
      salePrice: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (producto) {
      reset({
        name: producto.name,
        description: producto.description,
        salePrice: producto.salePrice,
        isActive: producto.isActive,
      });
    }
  }, [producto, reset]);

  const onSubmit = (values: ProductoFormValues) => {
    if (isEditMode && id) {
      updateProducto(
        { id, payload: values },
        {
          onSuccess: () => {
            setSnackbarMessage("Producto actualizado correctamente");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            navigate(TIENDA_ROUTES.PRODUCTOS);
          },
          onError: (err) => {
            if (isNetworkError(err)) return;
            setSnackbarMessage("Error al actualizar el producto");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          },
        },
      );
    } else {
      createProducto(values, {
        onSuccess: () => {
          setSnackbarMessage("Producto creado correctamente");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          navigate(TIENDA_ROUTES.PRODUCTOS);
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
          setSnackbarMessage("Error al crear el producto");
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
    producto,
    isLoadingProducto,
    errorProducto,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    onCloseSnackbar: () => setSnackbarOpen(false),
    onSubmit,
  };
}
