"use client";

import {
  ChevronRight,
  Grid,
  SidebarCollapse,
  Spinner,
} from "@common/components/icons";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "antd";
import { cn } from "@common/lib/core/utils";
import { locales } from "@common/lib/i18n/routing";
import { useHasPermission } from "@common/components/layout/providers/PermissionProvider";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useTranslations } from "next-intl";

const MIN_LOADING_MS = 2000;

type ChildItem = Readonly<{
  labelKey: string;
  destPath: string;
  pattern: string;
  icon?: React.ReactNode;
  // Mã quyền cần có để thấy mục này; bỏ trống ⇒ luôn hiển thị.
  permission?: string;
}>;

type MenuItem = Readonly<{
  // Dùng *Key để dịch qua i18n, hoặc section/label để gán trực tiếp tiếng Việt.
  sectionKey?: string;
  section?: string;
  labelKey?: string;
  label?: string;
  destPath: string;
  pattern: string;
  icon?: React.ReactNode;
  children?: ChildItem[];
  // Mã quyền cần có để thấy mục này; bỏ trống ⇒ luôn hiển thị.
  permission?: string;
}>;

// Skeleton: chỉ giữ feature mẫu "Danh mục".
// Thêm mục mới vào đây khi tạo feature mới (xem AppSidebar gốc để biết cách dùng
// children / permission / sectionKey).
const MENU: MenuItem[] = [
  {
    section: "Quản trị",
    label: "Danh mục (mẫu)",
    destPath: "/admin/categories",
    pattern: "/admin/categories",
    icon: <Grid size={16} />,
  },
];

function useNormalizedPathname() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const withLocale = locales.includes(segments[0] as (typeof locales)[number]);
  return "/" + (withLocale ? segments.slice(1) : segments).join("/");
}

function matchesPattern(pathname: string, pattern: string): boolean {
  return pathname === pattern || pathname.startsWith(pattern + "/");
}

function ChildNavItem({
  item,
  t,
  pendingPath,
  onNavigate,
}: Readonly<{
  item: ChildItem;
  t: ReturnType<typeof useTranslations>;
  pendingPath: string | null;
  onNavigate: (path: string) => void;
}>) {
  const pathname = useNormalizedPathname();
  const isActive = matchesPattern(pathname, item.pattern);
  const isPending = pendingPath === item.destPath;

  const highlight = isActive || isPending;

  return (
    <li>
      <Link
        href={item.destPath}
        onClick={(e) => {
          if (
            e.button !== 0 ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey
          ) {
            return;
          }
          e.preventDefault();
          if (pathname === item.destPath) return;
          onNavigate(item.destPath);
        }}
        className={cn(
          "flex h-[36px] items-center justify-between gap-[10px] rounded-lg pl-[34px] pr-3 text-[13px] transition-colors",
          highlight
            ? "dark:bg-blue-700/20 bg-blue-100 font-medium text-blue-700 dark:text-blue-500"
            : "font-normal text-neutral-700 hover:bg-neutral-50 dark:text-neutral-dark-700 dark:hover:bg-neutral-dark-50",
        )}
      >
        <div className="flex min-w-0 items-center gap-[10px]">
          {item.icon && (
            <span
              className={cn(
                "shrink-0",
                highlight
                  ? "text-blue-700 dark:text-blue-500"
                  : "text-neutral-500 dark:text-neutral-dark-500",
              )}
            >
              {item.icon}
            </span>
          )}
          <span className="truncate">
            {t(item.labelKey as Parameters<typeof t>[0])}
          </span>
        </div>
        {isPending ? (
          <Spinner
            size={12}
            className="shrink-0 text-blue-700 dark:text-blue-500"
          />
        ) : (
          isActive && (
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-blue-700 opacity-75 dark:bg-blue-500" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-blue-700 dark:bg-blue-500" />
            </span>
          )
        )}
      </Link>
    </li>
  );
}

function NavItem({
  item,
  collapsed,
  t,
  pendingPath,
  onNavigate,
  onExpand,
}: Readonly<{
  item: MenuItem;
  collapsed: boolean;
  t: ReturnType<typeof useTranslations>;
  pendingPath: string | null;
  onNavigate: (path: string) => void;
  onExpand: () => void;
}>) {
  const pathname = useNormalizedPathname();
  const hasChildren = (item.children?.length ?? 0) > 0;
  const isActive = !hasChildren && matchesPattern(pathname, item.pattern);
  const hasActiveChild =
    item.children?.some((c) => matchesPattern(pathname, c.pattern)) ?? false;
  const [open, setOpen] = useState(hasActiveChild);
  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  const highlight = isActive || hasActiveChild;

  // Ưu tiên chuỗi tiếng Việt gán trực tiếp; nếu không có thì mới dịch qua i18n.
  const label =
    item.label ??
    (item.labelKey ? t(item.labelKey as Parameters<typeof t>[0]) : "");
  const sectionLabel =
    item.section ??
    (item.sectionKey
      ? t(item.sectionKey as Parameters<typeof t>[0])
      : undefined);

  return (
    <>
      {sectionLabel && !collapsed && (
        <li className="px-3 pb-1 pt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-dark-400">
            {sectionLabel}
          </span>
        </li>
      )}
      {sectionLabel && collapsed && <li className="pt-3" />}

      <li className={collapsed ? "px-1" : "px-2"}>
        <Tooltip title={collapsed ? label : ""} placement="right">
          <button
            onClick={() => {
              if (collapsed) {
                // Khi sidebar đang thu gọn: mở rộng lại và mở luôn menu tổng vừa bấm.
                onExpand();
                if (hasChildren) {
                  setOpen(true);
                } else {
                  onNavigate(item.destPath);
                }
                return;
              }
              // Có menu con: bật/tắt accordion. Không có: điều hướng trực tiếp.
              if (hasChildren) {
                setOpen(!open);
              } else {
                onNavigate(item.destPath);
              }
            }}
            className={cn(
              "flex w-full items-center rounded-lg transition-colors",
              collapsed ? "justify-center px-3 py-[10px]" : "px-3 py-[10px]",
              highlight
                ? "dark:bg-blue-700/20 bg-blue-100 text-blue-700 dark:text-blue-500"
                : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-dark-700 dark:hover:bg-neutral-dark-50",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 flex-1 items-center",
                collapsed ? "justify-center gap-0" : "gap-[10px]",
              )}
            >
              {item.icon && (
                <span
                  className={cn(
                    "shrink-0",
                    highlight
                      ? "text-blue-700 dark:text-blue-500"
                      : "text-neutral-500 dark:text-neutral-dark-500",
                  )}
                >
                  {item.icon}
                </span>
              )}
              {!collapsed && (
                <span
                  className={cn(
                    "truncate text-[13px]",
                    highlight ? "font-semibold" : "font-medium",
                  )}
                >
                  {label}
                </span>
              )}
            </div>
            {!collapsed && hasChildren && (
              <span
                className={cn(
                  "ml-2 shrink-0 text-neutral-400 transition-transform dark:text-neutral-dark-400",
                  open && "rotate-90",
                )}
              >
                <ChevronRight size={12} />
              </span>
            )}
            {!collapsed && !hasChildren && isActive && (
              <span className="relative ml-2 flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inset-0 animate-ping rounded-full bg-blue-700 opacity-75 dark:bg-blue-500" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-blue-700 dark:bg-blue-500" />
              </span>
            )}
          </button>
        </Tooltip>
      </li>

      {hasChildren && open && !collapsed && (
        <li>
          <ul className="flex flex-col gap-0.5 px-2 pt-0.5">
            {item.children?.map((child) => (
              <ChildNavItem
                key={child.pattern}
                item={child}
                t={t}
                pendingPath={pendingPath}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </li>
      )}
    </>
  );
}

type AppSidebarProps = Readonly<{
  collapsed: boolean;
  onToggle: () => void;
}>;

export default function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const t = useTranslations("dashboard.nav");
  const has = useHasPermission();
  const router = useRouter();
  const setIsNavigating = useLayoutStore((state) => state.setIsNavigating);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingPath) return;
    const timer = setTimeout(() => {
      setPendingPath(null);
    }, MIN_LOADING_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [pendingPath]);

  const handleNavigate = (path: string) => {
    setPendingPath(path);
    setIsNavigating(true);
    router.push(path);
  };

  // Ẩn mục thiếu quyền; nhóm có con nhưng rỗng sau khi lọc cũng ẩn theo.
  const visibleMenu = MENU.flatMap((item) => {
    if (item.permission && !has(item.permission)) return [];
    if (!item.children) return [item];
    const children = item.children.filter(
      (c) => !c.permission || has(c.permission),
    );
    return children.length ? [{ ...item, children }] : [];
  });

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col border-r border-neutral-200 bg-white transition-all duration-200 dark:border-neutral-dark-200 dark:bg-neutral-dark-0",
        collapsed ? "w-[76px]" : "w-[280px]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        className="absolute right-[-14px] top-[14px] z-20 flex h-7 w-7 items-center justify-center rounded-[6px] border border-neutral-200 bg-white text-neutral-500 shadow-[0px_2px_4px_0px_rgba(15,42,81,0.05)] hover:bg-neutral-50 dark:border-neutral-dark-200 dark:bg-neutral-dark-0 dark:hover:bg-neutral-dark-50"
      >
        <SidebarCollapse
          size={18}
          className={collapsed ? "rotate-180" : undefined}
        />
      </button>
      {/* Header */}
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          collapsed ? "px-2 py-4" : "gap-3 p-[25px]",
        )}
      >
        <Link
          href="/admin/categories"
          aria-label="Danh mục"
          className="focus-visible inline-flex shrink-0 focus-visible:rounded"
        >
          <Image
            src={collapsed ? "/image/logo.png" : "/image/logo1.png"}
            alt="Logo"
            width={collapsed ? 36 : 135}
            height={collapsed ? 36 : 48}
            className="shrink-0 cursor-pointer object-contain transition-all"
          />
        </Link>
        {/* Tiêu đề hệ thống — chỉ hiện khi sidebar mở rộng. */}
        {!collapsed && (
          <div className="text-center">
            <p className="text-[13px] font-semibold leading-snug text-neutral-900 dark:text-neutral-dark-900">
              Hệ thống tích hợp, chia sẻ dữ liệu
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-neutral-500 dark:text-neutral-dark-500">
              Trung tâm Sáng tạo, Khai thác Dữ liệu
            </p>
          </div>
        )}
      </div>

      <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-2">
        {visibleMenu.map((item) => (
          <NavItem
            key={item.pattern}
            item={item}
            collapsed={collapsed}
            t={t}
            pendingPath={pendingPath}
            onNavigate={handleNavigate}
            onExpand={onToggle}
          />
        ))}
      </ul>
    </aside>
  );
}
