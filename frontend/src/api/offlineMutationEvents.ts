type OpenDialogCallback = () => void;

let _openDialog: OpenDialogCallback | null = null;

export function isNetworkError(error: Error): boolean {
  const axiosCode = (error as Error & { code?: string }).code;
  if (axiosCode === "ERR_NETWORK") return true;
  if (error.message === "Network Error") return true;
  return false;
}

export const offlineMutationEvents = {
  register(fn: OpenDialogCallback): void {
    _openDialog = fn;
  },
  unregister(): void {
    _openDialog = null;
  },
  trigger(): void {
    _openDialog?.();
  },
};
