import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { API } from "@modules/profile/constants/api";
import type { ForgotPasswordFormValues } from "../types";

export const forgotPassword = async (payload: ForgotPasswordFormValues): Promise<void> => {
  await apiClient.post(API.USERS_FORGOT_PASSWORD, payload);
};

export const useForgotPasswordMutation = () => useMutation({ mutationFn: forgotPassword });
