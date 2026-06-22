import { PERM } from "@common/lib/core/permissions";
import PermissionRouteGate from "@common/components/layout/PermissionRouteGate";
import type { ReactNode } from "react";

// Gate "Quản lý danh mục phần mềm kết nối" theo quyền xem module quản trị phần mềm.
export default function CategoriesLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <PermissionRouteGate permission={PERM.SOFTWARE.READ}>
      {children}
    </PermissionRouteGate>
  );
}
