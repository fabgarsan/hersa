import type { Control, FieldError, FieldPath, FieldValues } from "react-hook-form";
import type { ModulePermission } from "@shared/types/permissions";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  variant?: "initial" | "filtered" | "permission";
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export interface LoadingStateProps {
  variant?: "spinner" | "skeleton";
  rows?: number;
  label?: string;
}

export interface LayoutProps {
  children: ReactNode;
}

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

export interface ComingSoonStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
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

export interface MutationButtonProps {
  isPending: boolean;
  label: string;
  pendingLabel: string;
  fullWidth?: boolean;
}

export interface AuthGuardProps {
  children: ReactNode;
}

export interface OfflineMutationDialogProps {
  open: boolean;
  onClose: () => void;
}
