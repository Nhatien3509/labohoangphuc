"use client";

import { Download, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@common/components/ui/dialog";
import { errorMessage } from "@common/lib/helpers/warranty";

import { type ImportResult, importWarrantiesAction } from "../_apis/actions";
import type { CreateWarrantyPayload } from "../_apis/types";
import {
  createWarrantySchema,
  parseToothPositions,
  yearsToMonths,
} from "../_lib/const";

// Tên cột file Excel — khớp các trường trong popup "Phát hành thẻ".
const COLUMNS = [
  "Mã bảo hành",
  "Tên khách hàng",
  "Nha khoa",
  "Lab",
  "Số năm bảo hành",
  "Ngày phát hành",
  "Vị trí răng",
  "Ghi chú",
] as const;

type RawRow = Record<string, unknown>;

/** Chuyển giá trị ô ngày (Date của Excel hoặc chuỗi) về "YYYY-MM-DD". */
function toISODate(v: unknown): string {
  if (v == null || v === "") return "";
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
  }
  return s; // để validation bắt lỗi nếu sai định dạng
}

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

interface ImportSummary extends ImportResult {
  total: number;
}

export function ImportWarranty() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  async function downloadTemplate() {
    const XLSX = await import("xlsx");
    const sample = {
      "Mã bảo hành": "BH-20260099",
      "Tên khách hàng": "Nguyễn Văn A",
      "Nha khoa": "Nha khoa Smile",
      Lab: "Lab Hà Nội",
      "Số năm bảo hành": 7,
      "Ngày phát hành": "2026-01-15",
      "Vị trí răng": "11, 12, 21",
      "Ghi chú": "Ghi chú (không bắt buộc)",
    };
    const ws = XLSX.utils.json_to_sheet([sample], { header: [...COLUMNS] });
    ws["!cols"] = COLUMNS.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thẻ bảo hành");
    const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const blob = new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mau-import-the-bao-hanh.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng file
    if (!file) return;

    let rows: RawRow[];
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheetName = wb.SheetNames[0];
      const ws = sheetName ? wb.Sheets[sheetName] : undefined;
      if (!ws) {
        toast.error("File Excel không có dữ liệu");
        return;
      }
      rows = XLSX.utils.sheet_to_json<RawRow>(ws, { defval: "" });
    } catch {
      toast.error("Không đọc được file Excel");
      return;
    }

    if (rows.length === 0) {
      toast.error("File không có dòng dữ liệu nào");
      return;
    }

    const payloads: CreateWarrantyPayload[] = [];
    const failed: ImportResult["failed"] = [];

    rows.forEach((row, idx) => {
      const values = {
        code: str(row["Mã bảo hành"]),
        customer_name: str(row["Tên khách hàng"]),
        clinic_name: str(row["Nha khoa"]),
        lab_name: str(row["Lab"]),
        warranty_years: str(row["Số năm bảo hành"]),
        issue_date: toISODate(row["Ngày phát hành"]),
        tooth_positions: str(row["Vị trí răng"]),
        note: str(row["Ghi chú"]),
      };
      const parsed = createWarrantySchema.safeParse(values);
      if (!parsed.success) {
        failed.push({
          code: values.code || `Dòng ${idx + 2}`,
          error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
        });
        return;
      }
      const { warranty_years, ...rest } = parsed.data;
      payloads.push({
        ...rest,
        tooth_positions: parseToothPositions(parsed.data.tooth_positions),
        warranty_months: yearsToMonths(warranty_years),
      });
    });

    startTransition(async () => {
      const res =
        payloads.length > 0
          ? await importWarrantiesAction(payloads)
          : { created: 0, failed: [] };
      const allFailed = [...failed, ...res.failed];
      setSummary({
        created: res.created,
        failed: allFailed,
        total: rows.length,
      });
      setOpen(true);
      if (res.created > 0) {
        toast.success(`Đã nhập ${res.created} thẻ`);
        router.refresh();
      }
      if (allFailed.length > 0) {
        toast.error(`${allFailed.length} dòng bị lỗi`);
      }
    });
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={onFile}
      />
      <Button variant="outline" onClick={downloadTemplate}>
        <Download className="h-4 w-4" />
        Tải file mẫu
      </Button>
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
      >
        <Upload className="h-4 w-4" />
        {pending ? "Đang nhập..." : "Nhập Excel"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kết quả nhập Excel</DialogTitle>
            <DialogDescription>
              Tổng {summary?.total ?? 0} dòng — {summary?.created ?? 0} thành
              công, {summary?.failed.length ?? 0} lỗi.
            </DialogDescription>
          </DialogHeader>

          {summary && summary.failed.length > 0 ? (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {summary.failed.map((f, i) => (
                <div
                  key={i}
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{f.code}</span>:{" "}
                  {errorMessage(f.error)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-success">
              Tất cả các dòng đã được nhập thành công.
            </p>
          )}

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
