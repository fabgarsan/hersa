import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { API } from "@shared/constants/api";
import type { UserMe } from "./types";

const fetchMe = async (): Promise<UserMe> => {
  const { data } = await apiClient.get<UserMe>(API.USERS_ME);
  return data;
};

export const useMeQuery = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });
