import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { isNetworkError } from "@api/offlineMutationEvents";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { recepcionSchema } from "../schemas";
import { useRecepcionarOrdenMutation } from "../api/recepcionarOrdenMutation";
import type { RecepcionFormValues, UseRecepcionFormReturn } from "../types";

export function useRecepcionForm(): UseRecepcionFormReturn {
  const { id: ordenId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { mutate: recepcionar, isPending } = useRecepcionarOrdenMutation();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const { control, handleSubmit } = useForm<RecepcionFormValues>({
    resolver: zodResolver(recepcionSchema),
    defaultValues: {
      orderLine: "",
      receivedQuantityGood: "",
      damagedQuantity: "0",
      realUnitCost: "",
      ubicacionId: "",
      cantidad: "",
    },
  });

  const onSubmit = (values: RecepcionFormValues) => {
    if (!ordenId) return;

    recepcionar(
      {
        ordenId,
        orderLine: values.orderLine,
        receivedQuantityGood: parseInt(values.receivedQuantityGood, 10),
        damagedQuantity: parseInt(values.damagedQuantity, 10),
        realUnitCost: values.realUnitCost,
        destinations: [
          {
            ubicacionId: values.ubicacionId,
            cantidad: parseInt(values.cantidad, 10),
          },
        ],
      },
      {
        onSuccess: () => {
          setSnackbarMessage("Recepción registrada correctamente");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          navigate(`${TIENDA_ROUTES.ORDENES}/${ordenId}`);
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
          setSnackbarMessage("Error al registrar la recepción");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        },
      },
    );
  };

  return {
    control,
    handleSubmit,
    isSubmitting: isPending,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    onCloseSnackbar: () => setSnackbarOpen(false),
    onSubmit,
  };
}
