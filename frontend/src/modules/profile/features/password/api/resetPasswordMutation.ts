import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { API } from "../../../constants/api";
import type { ResetPasswordFormValues } from "../types";

interface ResetPasswordPayload extends ResetPasswordFormValues {
  uid: string;
  token: string;
}

const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await apiClient.post(API.USERS_RESET_PASSWORD, {
    uid: payload.uid,
    token: payload.token,
    new_password: payload.newPassword,
    confirm_password: payload.confirmPassword,
  });
};

export const useResetPasswordMutation = () => useMutation({ mutationFn: resetPassword });
