import "server-only";

import Forbidden from "@common/components/layout/errors/Forbidden";
import type { ReactNode } from "react";
import { getCurrentPermissions } from "@common/lib/core/auth";

/**
 * Chặn truy cập route khi thiếu quyền (đọc permissions từ session). Dùng trong
 * `layout.tsx` của module cần gate. Thiếu quyền ⇒ render trang 403 thay nội dung.
 */
export default async function PermissionRouteGate({
  permission,
  children,
}: Readonly<{ permission: string; children: ReactNode }>) {
  const permissions = await getCurrentPermissions();
  if (!permissions.includes(permission)) return <Forbidden />;
  return <>{children}</>;
}
