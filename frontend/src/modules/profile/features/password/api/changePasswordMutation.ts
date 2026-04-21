import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { API } from "../../../constants/api";
import type { ChangePasswordFormValues } from "../types";

const changePassword = async (payload: ChangePasswordFormValues): Promise<void> => {
  await apiClient.post(API.USERS_CHANGE_PASSWORD, {
    current_password: payload.currentPassword,
    new_password: payload.newPassword,
    confirm_password: payload.confirmPassword,
  });
};

export const useChangePasswordMutation = () => useMutation({ mutationFn: changePassword });
