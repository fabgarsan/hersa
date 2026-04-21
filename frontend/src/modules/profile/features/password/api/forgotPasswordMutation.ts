import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { API } from "../../../constants/api";
import type { ForgotPasswordFormValues } from "../types";

const forgotPassword = async (payload: ForgotPasswordFormValues): Promise<void> => {
  await apiClient.post(API.USERS_FORGOT_PASSWORD, {
    username_or_email: payload.usernameOrEmail,
  });
};

export const useForgotPasswordMutation = () => useMutation({ mutationFn: forgotPassword });
