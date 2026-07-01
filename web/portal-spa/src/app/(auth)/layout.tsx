import {
  BadgeCheck,
  LayoutDashboard,
  Lock,
  Search,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import { cn } from "@common/lib/core/utils";
import { SITE } from "@common/lib/core/site";

import { BrandLogo } from "./_components/BrandLogo";
import { SnowEffect } from "./_components/SnowEffect";

const FEATURES: { icon: LucideIcon; label: string; color: string }[] = [
  { icon: LayoutDashboard, label: "Quản lý thẻ", color: "bg-blue-500" },
  { icon: Lock, label: "Bảo mật cao", color: "bg-green-500" },
  { icon: Search, label: "Tra cứu nhanh", color: "bg-red-500" },
  { icon: BadgeCheck, label: "Phát hành thẻ", color: "bg-cyan-500" },
];

// Vị trí các chấm trang trí mờ trên nền xanh.
const DOTS = [
  "left-[8%] top-[12%]",
  "left-[18%] top-[45%]",
  "left-[12%] top-[78%]",
  "right-[10%] top-[20%]",
  "right-[16%] top-[62%]",
  "right-[8%] top-[85%]",
];

/**
 * Khung xác thực split-screen: panel thương hiệu (trái) + khu form (phải).
 * Trên mobile ẩn panel trái, gộp 1 cột kèm logo phía trên form.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Panel thương hiệu — hiển thị từ md (tablet) trở lên */}
      <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-dark p-8 text-white md:flex lg:p-12">
        <SnowEffect />
        {DOTS.map((pos) => (
          <span
            key={pos}
            className={cn(
              "absolute h-1.5 w-1.5 rounded-full bg-white/25",
              pos,
            )}
          />
        ))}

        <div className="relative flex w-full max-w-md flex-col items-center text-center">
          {/* Logo 220×220 nghiêng theo con trỏ chuột */}
          <BrandLogo />

          <h1 className="mt-6 text-2xl font-bold uppercase tracking-wide">
            {SITE.name}
          </h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/80">
            {SITE.tagline}
          </p>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/75">
            Nền tảng phát hành và tra cứu thẻ bảo hành răng sứ tập trung cho các
            phòng khám nha khoa trên toàn quốc.
          </p>

          {/* 4 thẻ tính năng (2×2) */}
          <div className="mt-8 grid w-full grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-4 text-left ring-1 ring-white/15 backdrop-blur"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow",
                    f.color,
                  )}
                >
                  <f.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold leading-tight">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {SITE.name} — {SITE.tagline}
        </div>
      </aside>

      {/* Khu form đăng nhập */}
      <main className="flex flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          {/* Logo cho mobile (ẩn từ md trở lên vì đã có panel trái) */}
          <div className="mb-8 flex items-center justify-center md:hidden">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-md ring-1 ring-border">
              <Image
                src="/products/labo.jpg"
                alt={SITE.name}
                width={1392}
                height={1130}
                priority
                className="h-full w-full object-contain"
              />
            </span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
