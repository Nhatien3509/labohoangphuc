"use client";

import { Avatar, AvatarFallback } from "@common/components/ui/avatar";
import {
  ChevronRight,
  Grid,
  Notifications,
  SignOut,
} from "@common/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import type { SessionData, SsoUserInfo } from "@common/lib/core/auth";
import {
  getFirstAndLastName,
  getInitials,
  toTitleCase,
} from "@common/lib/helpers/str";
import { BASE_PATH } from "@common/lib/core/const";
import Link from "next/link";
import { cn } from "@common/lib/core/utils";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const ROUTE_NAV_KEYS: Record<
  string,
  {
    // Dùng *Key để dịch i18n, hoặc label/parentLabel để gán trực tiếp tiếng Việt.
    labelKey?: string;
    label?: string;
    parentLabelKey?: string;
    parentLabel?: string;
    parentPath?: string;
  }
> = {
  // Skeleton: chỉ giữ breadcrumb cho feature mẫu "Danh mục".
  "/admin/categories": {
    labelKey: "items.categories_software",
    parentLabelKey: "items.categories",
  },
};

const ChatIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("h-5 w-5", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
    />
  </svg>
);

export default function AppTopBar({
  user,
  ssoUser,
}: Readonly<{ user?: SessionData["user"]; ssoUser?: SsoUserInfo }>) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");

  const segments = pathname.split("/").filter(Boolean);
  const locales = ["vi", "en"];
  const filtered =
    segments[0] && locales.includes(segments[0]) ? segments.slice(1) : segments;
  const currentPath = "/" + filtered.join("/");

  // Ưu tiên chuỗi tiếng Việt gán trực tiếp; nếu không có thì mới dịch qua i18n.
  const resolveLabel = (label?: string, key?: string) =>
    label ?? (key ? t(key as Parameters<typeof t>[0]) : undefined);

  const current = ROUTE_NAV_KEYS[currentPath];
  const parent = current?.parentPath
    ? ROUTE_NAV_KEYS[current.parentPath]
    : undefined;
  const parentLabel =
    resolveLabel(current?.parentLabel, current?.parentLabelKey) ??
    resolveLabel(parent?.label, parent?.labelKey);
  const currentLabel = resolveLabel(current?.label, current?.labelKey);

  const fullName = [ssoUser?.fullName, user?.name].find(Boolean) ?? "";
  const displayName = toTitleCase(getFirstAndLastName(fullName));
  const rawInitials = getInitials(displayName);
  const initials = rawInitials.length > 0 ? rawInitials : "U";
  const subtitle = [ssoUser?.username, user?.email, user?.sub].find(Boolean);
  const primaryLabel = displayName.length > 0 ? displayName : subtitle;

  // Toàn bộ thông tin trả về từ API đăng nhập (bỏ trường rỗng)
  const infoRows: { label: string; value?: string }[] = ssoUser
    ? [
        { label: "Tên đăng nhập", value: ssoUser.username },
        { label: "Họ tên", value: ssoUser.fullName },
        { label: "Email", value: ssoUser.email },
        { label: "Số điện thoại", value: ssoUser.phone },
        { label: "Trạng thái", value: ssoUser.status },
        { label: "Loại tài khoản", value: ssoUser.accountTypeName },
        { label: "Mã loại tài khoản", value: ssoUser.accountType },
        { label: "Đơn vị", value: ssoUser.unitName },
        { label: "Mã đơn vị", value: ssoUser.unitCode },
        { label: "Số giấy tờ", value: ssoUser.idNo },
        { label: "Nơi cấp", value: ssoUser.idIssuePlace },
      ].filter((row) => Boolean(row.value))
    : [];

  const handleLogout = () => {
    window.location.href = `${BASE_PATH}/auth/sso/logout`;
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-100 bg-white px-6 dark:border-neutral-dark-100 dark:bg-neutral-dark-0">
      <nav className="flex min-w-0 items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-dark-600">
        {parentLabel && (
          <>
            {current?.parentPath ? (
              <Link
                href={current.parentPath}
                className="hover:text-primary-600 shrink-0 transition-colors"
              >
                {parentLabel}
              </Link>
            ) : (
              <span className="shrink-0">{parentLabel}</span>
            )}
            <ChevronRight size={14} className="shrink-0 text-neutral-400" />
          </>
        )}
        {current && (
          <span className="truncate font-semibold text-neutral-900 dark:text-neutral-dark-900">
            {currentLabel}
          </span>
        )}
      </nav>

      <div className="flex shrink-0 items-center gap-3">
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-dark-50">
          <Notifications size={20} />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-dark-50">
          <ChatIcon />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-dark-50">
          <Grid size={20} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 rounded-lg p-0">
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-blue-600 text-sm font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-dark-900">
                  {primaryLabel}
                </p>
                {subtitle && (
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-dark-500">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {infoRows.length > 0 && (
              <>
                <DropdownMenuSeparator className="my-0 bg-neutral-100 dark:bg-neutral-dark-100" />
                <div className="max-h-[50vh] overflow-auto px-4 py-2">
                  {infoRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start justify-between gap-4 py-1 text-xs"
                    >
                      <span className="shrink-0 text-neutral-500 dark:text-neutral-dark-500">
                        {row.label}
                      </span>
                      <span className="min-w-0 break-words text-right font-medium text-neutral-900 dark:text-neutral-dark-900">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <DropdownMenuSeparator className="my-0 bg-neutral-100 dark:bg-neutral-dark-100" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 focus:bg-neutral-100 dark:text-neutral-dark-700 dark:focus:bg-neutral-dark-50"
            >
              <SignOut className="text-neutral-500" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
