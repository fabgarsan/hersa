import type { ModulePermission } from "@shared/types/permissions";
import type { ReactNode } from "react";

export type { ModulePermission } from "@shared/types/permissions";

export interface AppHeaderProps {
  onMenuClick: () => void;
}

export interface ModuleGuardProps {
  module: ModulePermission;
  children: ReactNode;
}

export interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
  module: ModulePermission | null;
}

export interface ModuleLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}
