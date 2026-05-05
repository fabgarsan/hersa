import type { ReactNode } from "react";

export interface TiendaTabBarProps {}

export interface TiendaTabItem {
  label: string;
  path: string;
  icon: ReactNode;
}
