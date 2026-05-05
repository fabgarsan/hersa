export type TiendaRole = "admin" | "vendedor" | "none";

export interface UseTiendaRoleReturn {
  isAdmin: boolean;
  isVendedor: boolean;
  role: TiendaRole;
}
