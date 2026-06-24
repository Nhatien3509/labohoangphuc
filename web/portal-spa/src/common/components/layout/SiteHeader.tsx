"use client";

import { Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@common/lib/core/utils";
import { SITE } from "@common/lib/core/site";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/tra-cuu", label: "Tra cứu thẻ bảo hành" },
];

/** Thanh điều hướng cố định cho khu vực công khai. */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 h-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-container items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-foreground">
            L
          </span>
          <span className="text-lg font-bold tracking-tight">
            Labo <span className="text-brand">Hoàng Phúc</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand text-brand-foreground"
                      : "text-foreground hover:bg-brand-soft hover:text-brand-dark",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <a
          href={`tel:${SITE.phoneRaw}`}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-dark"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">{SITE.phone}</span>
        </a>
      </div>
    </nav>
  );
}
