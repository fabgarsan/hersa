import type { Control, FieldError, FieldPath, FieldValues } from "react-hook-form";
import type { ModulePermission } from "@shared/types/permissions";
import type { ReactNode } from "react";

export type { ModulePermission } from "@shared/types/permissions";

export interface AppHeaderProps {
  onMenuClick: () => void;
}

export interface AuthPageCardProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export interface ComingSoonGridItem {
  label: string;
  description?: string;
  icon: ReactNode;
}

export interface ComingSoonGridProps {
  items: ComingSoonGridItem[];
}

export interface ModuleGuardProps {
  module: ModulePermission;
  children: ReactNode;
}

export interface ModuleLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
  module: ModulePermission | null;
}

export interface PasswordTextFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  error?: FieldError;
  autoFocus?: boolean;
}

export interface SubmitButtonProps {
  isPending: boolean;
  label: string;
  pendingLabel: string;
  fullWidth?: boolean;
}
