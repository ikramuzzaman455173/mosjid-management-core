import React, { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/errors/access-denied";

interface PermissionGuardProps {
  module: string;
  action?: string; // Optional: if provided, checks specific action. If only module, checks any access to module.
  children: ReactNode;
  fallback?: ReactNode;
  requireAdmin?: boolean;
  fallbackType?: "null" | "page"; // Determines what to show if 'fallback' is not explicitly provided
}

export function PermissionGuard({ 
  module, 
  action, 
  children, 
  fallback, 
  requireAdmin = false,
  fallbackType = "null"
}: PermissionGuardProps) {
  const { data, isLoading } = usePermissions();

  if (isLoading) {
    // Return null or a skeleton while loading permissions to prevent layout shift or flash of unauthorized content
    return null; 
  }

  // Super Admins bypass all permission checks
  if (data?.isSuperAdmin) {
    return <>{children}</>;
  }

  if (requireAdmin && !data?.isAdmin) {
    const defaultFallback = fallbackType === "page" ? <AccessDenied /> : null;
    const renderFallback = fallback !== undefined ? fallback : defaultFallback;
    return <>{renderFallback}</>;
  }

  // If no specific action is required, just checking if they have ANY permission for this module
  if (!action) {
    const hasAnyModuleAccess = Array.from(data?.permissions || []).some(p => p.startsWith(`${module.toLowerCase()}.`));
    if (!hasAnyModuleAccess) {
      const defaultFallback = fallbackType === "page" ? <AccessDenied /> : null;
      const renderFallback = fallback !== undefined ? fallback : defaultFallback;
      return <>{renderFallback}</>;
    }
    return <>{children}</>;
  }

  const defaultFallback = fallbackType === "page" ? <AccessDenied /> : null;
  const renderFallback = fallback !== undefined ? fallback : defaultFallback;

  // Check specific module and action
  const hasAccess = data?.permissions?.has(`${module.toLowerCase()}.${action.toLowerCase()}`);

  if (!hasAccess) {
    return <>{renderFallback}</>;
  }

  return <>{children}</>;
}
