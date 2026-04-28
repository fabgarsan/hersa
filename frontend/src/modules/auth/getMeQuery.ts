import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { API } from "@shared/constants/api";
// TODO: once `npm run generate:types` has run, validate UserMe against the
// generated schema:
//   import type { components } from "@api/generated/types";
//   type UserMeRaw = components["schemas"]["User"]; // snake_case from backend
// The axios interceptor converts snake_case → camelCase before React Query
// resolves, so UserMe (camelCase) remains the correct type for query data.
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
