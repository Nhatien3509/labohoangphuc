"use client";

import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@common/components/ui/dialog";
import { formatDate } from "@common/lib/helpers/datetime";
import {
  WARRANTY_STATUS_LABEL,
  errorMessage,
} from "@common/lib/helpers/warranty";

import { deleteWarrantyAction } from "../_apis/actions";
import type { AdminWarranty, WarrantyStatus } from "../_apis/types";
import { EditWarrantyDialog } from "./EditWarrantyDialog";

const STATUS_VARIANT: Record<
  WarrantyStatus,
  "success" | "secondary" | "destructive"
> = {
  active: "success",
  expired: "secondary",
  revoked: "destructive",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function DetailDialog({ item }: { item: AdminWarranty }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
          Xem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết thẻ {item.code}</DialogTitle>
          <DialogDescription>Thông tin đầy đủ của thẻ bảo hành.</DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <Row label="Mã thẻ" value={item.code} />
          <Row label="Khách hàng" value={item.customer_name} />
          <Row label="Số điện thoại" value={item.customer_phone || "—"} />
          <Row label="Lab" value={item.lab_name || "—"} />
          <Row
            label="Vị trí răng"
            value={item.tooth_positions?.join(", ") || "—"}
          />
          <Row label="Số tháng bảo hành" value={item.warranty_months} />
          <Row label="Ngày phát hành" value={formatDate(item.issue_date)} />
          <Row label="Ngày hết hạn" value={formatDate(item.expiry_date)} />
          <Row
            label="Trạng thái"
            value={
              <Badge variant={STATUS_VARIANT[item.status]}>
                {WARRANTY_STATUS_LABEL[item.status] ?? item.status}
              </Badge>
            }
          />
          <Row label="Ghi chú" value={item.note || "—"} />
          <Row label="Tạo lúc" value={formatDate(item.created_at)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ item }: { item: AdminWarranty }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      const res = await deleteWarrantyAction(item.id);
      if (res.success) {
        toast.success(`Đã xoá thẻ ${item.code}`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(errorMessage(res.error));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <Trash2 className="h-4 w-4" />
          Xoá
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xoá thẻ {item.code}?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Thẻ và lịch sử tra cứu liên quan sẽ
            bị xoá vĩnh viễn.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={pending}
          >
            {pending ? "Đang xoá..." : "Xoá thẻ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WarrantyActions({ item }: { item: AdminWarranty }) {
  return (
    <div className="flex justify-end gap-2">
      <DetailDialog item={item} />
      <EditWarrantyDialog item={item} />
      <DeleteDialog item={item} />
    </div>
  );
}
