import { Badge } from "@common/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@common/components/ui/table";
import { formatDate } from "@common/lib/helpers/datetime";
import { WARRANTY_STATUS_LABEL } from "@common/lib/helpers/warranty";

import type { AdminWarranty, WarrantyStatus } from "../_apis/types";
import { WarrantyActions } from "./WarrantyActions";

const STATUS_VARIANT: Record<
  WarrantyStatus,
  "success" | "secondary" | "destructive"
> = {
  active: "success",
  expired: "secondary",
  revoked: "destructive",
};

export function WarrantyTable({ items }: { items: AdminWarranty[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Chưa có thẻ bảo hành nào. Nhấn “Phát hành thẻ” để tạo mới.
      </div>
    );
  }

  return (
    <>
      {/* Mobile / tablet nhỏ: danh sách dạng thẻ */}
      <div className="grid gap-3 md:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{item.code}</div>
                <div className="truncate text-sm text-muted-foreground">
                  {item.customer_name}
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[item.status]}>
                {WARRANTY_STATUS_LABEL[item.status] ?? item.status}
              </Badge>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Nha khoa</dt>
                <dd className="truncate">{item.clinic_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Lab</dt>
                <dd className="truncate">{item.lab_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phát hành</dt>
                <dd>{formatDate(item.issue_date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Hết hạn</dt>
                <dd>{formatDate(item.expiry_date)}</dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-border pt-3">
              <WarrantyActions item={item} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: bảng đầy đủ */}
      <div className="hidden rounded-md border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã thẻ</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Nha khoa</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead>Phát hành</TableHead>
              <TableHead>Hết hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.code}</TableCell>
                <TableCell>{item.customer_name}</TableCell>
                <TableCell>{item.clinic_name || "—"}</TableCell>
                <TableCell>{item.lab_name}</TableCell>
                <TableCell>{formatDate(item.issue_date)}</TableCell>
                <TableCell>{formatDate(item.expiry_date)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[item.status]}>
                    {WARRANTY_STATUS_LABEL[item.status] ?? item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <WarrantyActions item={item} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
