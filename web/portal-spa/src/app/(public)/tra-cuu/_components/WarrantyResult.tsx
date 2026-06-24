import { CheckCircle2 } from "lucide-react";

import { formatDate } from "@common/lib/helpers/datetime";
import { cn } from "@common/lib/core/utils";

import type { PublicWarranty } from "../_apis/types";

function Field({
  label,
  value,
  className,
  accent = false,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background p-4",
        className,
      )}
    >
      <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "text-sm font-semibold",
          accent && "text-brand",
          mono && "font-mono",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function WarrantyResult({ data }: { data: PublicWarranty }) {
  return (
    <div className="animate-fade-up">
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <div className="text-[15px] font-semibold text-success">
            Thẻ bảo hành hợp lệ
          </div>
          <div className="text-[13px] text-success/80">
            Thông tin bảo hành chính hãng
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Mã số thẻ" value={data.code} mono />
        <Field label="Tên khách hàng" value={data.customer_name} />
        <Field label="Nha khoa" value={data.clinic_name} />
        <Field label="Lab" value={data.lab_name} />
        <Field
          label="Vị trí răng"
          value={data.tooth_positions?.join(", ") || "—"}
        />
        <Field label="Ngày phát hành" value={formatDate(data.issue_date)} />
        <Field
          label="Ngày hết hạn"
          value={formatDate(data.expiry_date)}
          className="sm:col-span-2"
          accent
        />
      </div>
    </div>
  );
}
