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
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã thẻ</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Lab</TableHead>
            <TableHead>Phát hành</TableHead>
            <TableHead>Hết hạn</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.code}</TableCell>
              <TableCell>{item.customer_name}</TableCell>
              <TableCell>{item.lab_name}</TableCell>
              <TableCell>{formatDate(item.issue_date)}</TableCell>
              <TableCell>{formatDate(item.expiry_date)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[item.status]}>
                  {WARRANTY_STATUS_LABEL[item.status] ?? item.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
