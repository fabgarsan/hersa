import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { API } from "./constants/api";
import type { LoginCredentials, TokenPair } from "./types";

export const login = async (credentials: LoginCredentials): Promise<TokenPair> => {
  const { data } = await apiClient.post<TokenPair>(API.TOKEN, credentials);
  return data;
};

export const useLoginMutation = () => useMutation({ mutationFn: login });
