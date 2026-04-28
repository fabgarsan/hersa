import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { isNetworkError } from "@api/offlineMutationEvents";

export interface UseOfflineMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export interface UseOfflineMutationReturn<TVariables> {
  mutate: (variables: TVariables) => void;
  isPending: boolean;
  offlineDialogOpen: boolean;
  closeOfflineDialog: () => void;
  /**
   * True for 3 seconds after the Dialog is closed while still offline,
   * or until the `online` event fires — whichever comes first.
   * Apply to submit button: `disabled={isResubmitBlocked}` + label "Sin conexión".
   */
  isResubmitBlocked: boolean;
}

export function useOfflineMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
}: UseOfflineMutationOptions<TData, TVariables>): UseOfflineMutationReturn<TVariables> {
  const [offlineDialogOpen, setOfflineDialogOpen] = useState(false);
  const [isResubmitBlocked, setIsResubmitBlocked] = useState(false);

  const resubmitBlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      if (resubmitBlockTimerRef.current !== null) {
        clearTimeout(resubmitBlockTimerRef.current);
        resubmitBlockTimerRef.current = null;
      }
      setIsResubmitBlocked(false);
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const { mutate: rawMutate, isPending } = useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data) => onSuccess?.(data),
    onError: (error) => {
      if (isNetworkError(error)) {
        setOfflineDialogOpen(true);
      } else {
        onError?.(error);
      }
    },
  });

  const closeOfflineDialog = useCallback(() => {
    setOfflineDialogOpen(false);
    setIsResubmitBlocked(true);
    resubmitBlockTimerRef.current = setTimeout(() => {
      setIsResubmitBlocked(false);
      resubmitBlockTimerRef.current = null;
    }, 3000);
  }, []);

  const mutate = useCallback((variables: TVariables) => rawMutate(variables), [rawMutate]);

  return {
    mutate,
    isPending,
    offlineDialogOpen,
    closeOfflineDialog,
    isResubmitBlocked,
  };
}
