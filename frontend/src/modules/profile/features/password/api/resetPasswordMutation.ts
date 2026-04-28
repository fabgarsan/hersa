import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { API } from "@modules/profile/constants/api";
import type { ResetPasswordPayload } from "../types";

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await apiClient.post(API.USERS_RESET_PASSWORD, payload);
};

export const useResetPasswordMutation = () => useMutation({ mutationFn: resetPassword });
