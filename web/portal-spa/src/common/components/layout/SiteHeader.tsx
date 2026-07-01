"use client";

import { Menu, Phone, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useState } from "react";

import { cn } from "@common/lib/core/utils";
import { SITE } from "@common/lib/core/site";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/tra-cuu", label: "Tra cứu thẻ bảo hành" },
];

/** Thanh điều hướng cố định cho khu vực công khai. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 h-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-container items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/products/labo.jpg"
            alt="Labo Hoàng Phúc"
            width={1392}
            height={1130}
            priority
            className="h-12 w-auto sm:h-16"
          />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-brand text-brand-foreground"
                    : "text-foreground hover:bg-brand-soft hover:text-brand-dark",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${SITE.hotlineRaw}`}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-dark sm:px-5"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">{SITE.hotline}</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-brand-soft md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu thả xuống cho mobile */}
      {open ? (
        <div className="border-b border-border bg-surface px-4 pb-3 pt-1 shadow-lg md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-brand text-brand-foreground"
                      : "text-foreground hover:bg-brand-soft hover:text-brand-dark",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
