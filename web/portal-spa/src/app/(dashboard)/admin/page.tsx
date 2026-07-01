import {
  ArrowRight,
  BadgeCheck,
  CalendarPlus,
  CalendarRange,
  type LucideIcon,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { Card } from "@common/components/ui/card";
import { cn } from "@common/lib/core/utils";

import { getWarrantyStats } from "./_apis/server";
import type { WarrantyStats } from "./_apis/types";
import { WarrantyChart } from "./_components/WarrantyChart";

// Đọc số liệu sống ở mỗi request (không prerender tĩnh).
export const dynamic = "force-dynamic";

const EMPTY: WarrantyStats = {
  total: 0,
  active: 0,
  expired: 0,
  revoked: 0,
  new_this_month: 0,
  new_this_year: 0,
  monthly: [],
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          tone,
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none">
          {value.toLocaleString("vi-VN")}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}

export default async function AdminHomePage() {
  const res = await getWarrantyStats();
  const stats = res.success && res.data ? res.data : EMPTY;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">
          Thống kê thẻ bảo hành Labo Hoàng Phúc.
        </p>
      </div>

      {/* Thẻ số liệu */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng số thẻ"
          value={stats.total}
          icon={ShieldCheck}
          tone="bg-brand-soft text-brand"
        />
        <StatCard
          label="Đang hoạt động"
          value={stats.active}
          icon={BadgeCheck}
          tone="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
        />
        <StatCard
          label="Thẻ mới tháng này"
          value={stats.new_this_month}
          icon={CalendarPlus}
          tone="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
        />
        <StatCard
          label="Thẻ mới năm nay"
          value={stats.new_this_year}
          icon={CalendarRange}
          tone="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
        />
      </div>

      {/* Biểu đồ */}
      <Card className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Thẻ tạo mới & tổng số thẻ theo tháng</h2>
            <p className="text-sm text-muted-foreground">
              12 tháng gần nhất
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-brand" />
              Thẻ tạo mới
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4 rounded-full bg-emerald-500" />
              Tổng luỹ kế
            </span>
          </div>
        </div>
        <div className="mt-4">
          <WarrantyChart data={stats.monthly} />
        </div>
      </Card>

      {/* Lối tắt quản lý */}
      <Link href="/admin/warranty-cards" className="block">
        <Card className="flex items-center justify-between p-5 transition-colors hover:border-primary">
          <div>
            <div className="font-semibold">Quản lý thẻ bảo hành</div>
            <div className="text-sm text-muted-foreground">
              Xem danh sách và phát hành thẻ bảo hành mới.
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary" />
        </Card>
      </Link>
    </div>
  );
}
