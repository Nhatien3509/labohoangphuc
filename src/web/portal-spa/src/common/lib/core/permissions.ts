/**
 * Phân quyền theo module — khớp 1:1 với BE admin-service
 * (internal/model/phan-quyen + internal/constants/permissions.go).
 * Mã quyền dạng `{module}:{action}`, vd `"quan-ly-nguoi-dung:read"`.
 *
 * File thuần (không import next/headers hay react) để dùng được ở cả server lẫn
 * client.
 */

/** Mã module phân quyền — đúng 5 module BE seed (`AllModules`). */
export const PERMISSION_MODULE = {
  ERROR_CODE: "quan-ly-ma-loi",
  USER: "quan-ly-nguoi-dung",
  SOFTWARE: "quan-tri-phan-mem",
  COMMON_CATEGORY: "quan-ly-danh-muc-dung-chung",
  INTEGRATION_SHARING: "quan-ly-tich-hop-chia-se",
} as const;

export type PermissionModule =
  (typeof PERMISSION_MODULE)[keyof typeof PERMISSION_MODULE];

/** Hành động trong một module (BE seed create/read/update/delete; sync riêng). */
export const PERMISSION_ACTION = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  SYNC: "sync",
} as const;

/** Ghép mã quyền `{module}:{action}`. */
export function permKey(module: PermissionModule, action: string): string {
  return `${module}:${action}`;
}

/**
 * Mã quyền theo module (mirror hằng số BE). BE seed mỗi module 4 quyền CRUD;
 * riêng `quan-ly-nguoi-dung:sync` là hằng số dùng cho check policy (không seed).
 */
export const PERM = {
  USER: {
    CREATE: "quan-ly-nguoi-dung:create",
    READ: "quan-ly-nguoi-dung:read",
    UPDATE: "quan-ly-nguoi-dung:update",
    DELETE: "quan-ly-nguoi-dung:delete",
    SYNC: "quan-ly-nguoi-dung:sync",
  },
  ERROR_CODE: {
    CREATE: "quan-ly-ma-loi:create",
    READ: "quan-ly-ma-loi:read",
    UPDATE: "quan-ly-ma-loi:update",
    DELETE: "quan-ly-ma-loi:delete",
  },
  SOFTWARE: {
    CREATE: "quan-tri-phan-mem:create",
    READ: "quan-tri-phan-mem:read",
    UPDATE: "quan-tri-phan-mem:update",
    DELETE: "quan-tri-phan-mem:delete",
  },
  COMMON_CATEGORY: {
    CREATE: "quan-ly-danh-muc-dung-chung:create",
    READ: "quan-ly-danh-muc-dung-chung:read",
    UPDATE: "quan-ly-danh-muc-dung-chung:update",
    DELETE: "quan-ly-danh-muc-dung-chung:delete",
  },
  INTEGRATION_SHARING: {
    CREATE: "quan-ly-tich-hop-chia-se:create",
    READ: "quan-ly-tich-hop-chia-se:read",
    UPDATE: "quan-ly-tich-hop-chia-se:update",
    DELETE: "quan-ly-tich-hop-chia-se:delete",
  },
} as const;

/** Có quyền `code` không. Không truyền code (undefined) ⇒ true (không gate). */
export function hasPermission(
  permissions: readonly string[],
  code?: string,
): boolean {
  return !code || permissions.includes(code);
}
