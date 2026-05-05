import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { isNetworkError } from "@api/offlineMutationEvents";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { createOrdenSchema } from "../schemas";
import { useGetOrdenQuery } from "../api/getOrdenQuery";
import { useCreateOrdenMutation } from "../api/createOrdenMutation";
import { useUpdateOrdenMutation } from "../api/updateOrdenMutation";
import type { OrdenFormValues, UseOrdenFormReturn } from "../types";

const DEFAULT_LINEA = {
  product: "",
  orderedQuantity: "",
  expectedUnitCost: "",
} as const;

export function useOrdenForm(): UseOrdenFormReturn {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { data: orden, isLoading: isLoadingOrden, error: errorOrden } = useGetOrdenQuery(id);

  const { mutate: createOrden, isPending: isCreating } = useCreateOrdenMutation();
  const { mutate: updateOrden, isPending: isUpdating } = useUpdateOrdenMutation();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const { control, handleSubmit, reset } = useForm<OrdenFormValues>({
    resolver: zodResolver(createOrdenSchema),
    defaultValues: {
      supplier: "",
      notes: "",
      orderLines: [{ ...DEFAULT_LINEA }],
    },
  });

  const { append, remove } = useFieldArray({ control, name: "orderLines" });

  useEffect(() => {
    if (orden) {
      reset({
        supplier: orden.supplier ?? "",
        notes: orden.notes,
        orderLines:
          orden.orderLines.length > 0
            ? orden.orderLines.map((l) => ({
                product: l.product,
                orderedQuantity: String(l.orderedQuantity ?? ""),
                expectedUnitCost: l.expectedUnitCost ?? "",
              }))
            : [{ ...DEFAULT_LINEA }],
      });
    }
  }, [orden, reset]);

  const onSubmit = (values: OrdenFormValues) => {
    const payload = {
      supplier: values.supplier || null,
      notes: values.notes,
      orderLines: values.orderLines.map((l) => ({
        product: l.product,
        orderedQuantity: parseInt(l.orderedQuantity, 10),
        expectedUnitCost: l.expectedUnitCost,
      })),
    };

    if (isEditMode && id) {
      updateOrden(
        { id, payload },
        {
          onSuccess: () => {
            setSnackbarMessage("Orden actualizada correctamente");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            navigate(`${TIENDA_ROUTES.ORDENES}/${id}`);
          },
          onError: (err) => {
            if (isNetworkError(err)) return;
            setSnackbarMessage("Error al actualizar la orden");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          },
        },
      );
    } else {
      createOrden(payload, {
        onSuccess: (data) => {
          setSnackbarMessage("Orden creada correctamente");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          navigate(`${TIENDA_ROUTES.ORDENES}/${data.id}`);
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
          setSnackbarMessage("Error al crear la orden");
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
    orden,
    isLoadingOrden,
    errorOrden: errorOrden as Error | null,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    onCloseSnackbar: () => setSnackbarOpen(false),
    onSubmit,
    appendLinea: () => append({ ...DEFAULT_LINEA }),
    removeLinea: (index: number) => remove(index),
  };
}
