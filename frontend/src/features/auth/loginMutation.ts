import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { LoginCredentials, TokenPair } from "./types";

const login = async (credentials: LoginCredentials): Promise<TokenPair> => {
  const { data } = await apiClient.post<TokenPair>("/api/token/", credentials);
  return data;
};

export const useLoginMutation = () =>
  useMutation({
    mutationFn: login,
    onSuccess: ({ access, refresh }) => {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
    },
  });
