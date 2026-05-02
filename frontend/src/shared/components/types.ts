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
  disabled?: boolean;
}

export interface PermissionGuardProps {
  /**
   * Outer array = OR, inner array = AND.
   * [[A, B], [C]] means (A AND B) OR C.
   * Omit to render without permission check.
   */
  requiredPermissions?: string[][];
  unauthorizedBehavior?: "hidden" | "disabled";
  unauthorizedTooltip?: string;
  children: ReactNode;
}

export interface AuthGuardProps {
  children: ReactNode;
}

export interface OfflineMutationDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: "warning" | "error" | "info";
  loading?: boolean;
}

export interface StatusChipConfig {
  label: string;
  color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

export interface StatusChipProps {
  status: string;
  statusMap: Record<string, StatusChipConfig>;
  size?: "small" | "medium";
}

export interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  divider?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  width?: number | string;
}
