import type { ReactNode } from "react";

export type TiendaTabBarProps = Record<string, never>;

export interface TiendaTabItem {
  label: string;
  path: string;
  icon: ReactNode;
}
