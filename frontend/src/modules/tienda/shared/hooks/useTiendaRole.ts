import { usePermissions } from "@shared/hooks/usePermissions";
import type { TiendaRole, UseTiendaRoleReturn } from "./types";

const PERM_ADMIN = "modules.access_tienda_admin";
const PERM_VENDEDOR = "modules.access_tienda_vendedor";

export function useTiendaRole(): UseTiendaRoleReturn {
  const { hasAccess } = usePermissions();

  const isAdmin = hasAccess(PERM_ADMIN);
  const isVendedor = hasAccess(PERM_VENDEDOR);

  let role: TiendaRole;
  if (isAdmin) {
    role = "admin";
  } else if (isVendedor) {
    role = "vendedor";
  } else {
    role = "none";
  }

  return { isAdmin, isVendedor, role };
}
