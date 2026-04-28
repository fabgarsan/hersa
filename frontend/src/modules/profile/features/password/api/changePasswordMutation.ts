import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { API } from "@modules/profile/constants/api";
import type { ChangePasswordFormValues } from "../types";

export const changePassword = async (payload: ChangePasswordFormValues): Promise<void> => {
  await apiClient.post(API.USERS_CHANGE_PASSWORD, payload);
};

export const useChangePasswordMutation = () => useMutation({ mutationFn: changePassword });
