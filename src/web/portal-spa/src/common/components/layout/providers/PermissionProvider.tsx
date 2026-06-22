"use client";

import React, { createContext, useCallback, useContext } from "react";
import { hasPermission } from "@common/lib/core/permissions";

const PermissionContext = createContext<readonly string[]>([]);

/** Cung cấp danh sách mã quyền của user hiện tại cho cây dashboard. */
export function PermissionProvider({
  permissions,
  children,
}: Readonly<{ permissions: readonly string[]; children: React.ReactNode }>) {
  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
}

/** Danh sách mã quyền của user hiện tại. */
export function usePermissions(): readonly string[] {
  return useContext(PermissionContext);
}

/** Hàm kiểm tra quyền: `has("EDIT_USER")`. Không truyền code ⇒ true. */
export function useHasPermission(): (code?: string) => boolean {
  const permissions = useContext(PermissionContext);
  return useCallback(
    (code?: string) => hasPermission(permissions, code),
    [permissions],
  );
}

/** Bọc UI cần quyền: `<Can permission="EXPORT_USER">...</Can>`. */
export function Can({
  permission,
  children,
  fallback = null,
}: Readonly<{
  permission?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}>) {
  const has = useHasPermission();
  return <>{has(permission) ? children : fallback}</>;
}
