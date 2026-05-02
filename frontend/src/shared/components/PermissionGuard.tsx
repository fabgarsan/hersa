import React from "react";
import Tooltip from "@mui/material/Tooltip";

import { usePermissions } from "@shared/hooks";
import type { PermissionGuardProps } from "./types";
import styles from "./PermissionGuard.module.scss";

export function PermissionGuard({
  requiredPermissions,
  unauthorizedBehavior = "hidden",
  unauthorizedTooltip,
  children,
}: PermissionGuardProps) {
  const { hasAccess } = usePermissions();

  const isUnauthorized =
    requiredPermissions !== undefined &&
    !requiredPermissions.some((andGroup) => andGroup.every((perm) => hasAccess(perm)));

  if (isUnauthorized && unauthorizedBehavior === "hidden") {
    return null;
  }

  const content =
    isUnauthorized && React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<{ disabled?: boolean }>, {
          disabled: true,
        })
      : children;

  if (isUnauthorized && unauthorizedTooltip) {
    return (
      <Tooltip title={unauthorizedTooltip} arrow>
        <span className={styles.tooltipWrapper}>{content}</span>
      </Tooltip>
    );
  }

  return <>{content}</>;
}
