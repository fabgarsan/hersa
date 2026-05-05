import { useGetJornadaAbiertaQuery } from "../api/getJornadaAbiertaQuery";
import { useTrasladoAperturaMutation } from "../api/trasladoAperturaMutation";
import { useReposicionMutation } from "../api/reposicionMutation";
import { useCerrarJornadaMutation } from "../api/cerrarJornadaMutation";
import type {
  CerrarJornadaInput,
  ReposicionInput,
  TrasladoAperturaInput,
  UseJornadaActionsReturn,
} from "../types";

export function useJornadaActions(): UseJornadaActionsReturn {
  const { data: jornada, isLoading: isLoadingJornada } = useGetJornadaAbiertaQuery();

  const { mutate: doTraslado, isPending: isTrasladando } = useTrasladoAperturaMutation();
  const { mutate: doReposicion, isPending: isReponiendo } = useReposicionMutation();
  const { mutate: doCerrar, isPending: isCerrando } = useCerrarJornadaMutation();

  const handleTraslado = (input: TrasladoAperturaInput) => {
    doTraslado(input);
  };

  const handleReposicion = (input: ReposicionInput) => {
    doReposicion(input);
  };

  const handleCerrar = (input: CerrarJornadaInput) => {
    doCerrar(input);
  };

  return {
    jornada,
    isLoadingJornada,
    isTrasladando,
    isReponiendo,
    isCerrando,
    handleTraslado,
    handleReposicion,
    handleCerrar,
  };
}
