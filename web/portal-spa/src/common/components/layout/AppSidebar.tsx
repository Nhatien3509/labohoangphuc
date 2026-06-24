"use client";

import { LayoutDashboard, ShieldCheck, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@common/lib/core/utils";

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Menu điều hướng admin. Thêm feature mới = thêm 1 mục vào đây
 * (theo README: "thêm một mục vào MENU trong AppSidebar").
 */
export const MENU: MenuItem[] = [
  {
    label: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Thẻ bảo hành",
    href: "/admin/warranty-cards",
    icon: ShieldCheck,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4 font-semibold">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Labo Bảo hành
      </div>
      <nav className="space-y-1 p-3">
        {MENU.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
