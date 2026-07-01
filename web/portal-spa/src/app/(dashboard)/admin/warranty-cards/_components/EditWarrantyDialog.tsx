"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { DatePicker } from "@common/components/ui/date-picker";
import { Input } from "@common/components/ui/input";
import { Label } from "@common/components/ui/label";
import { Textarea } from "@common/components/ui/textarea";
import { cn } from "@common/lib/core/utils";
import { errorMessage } from "@common/lib/helpers/warranty";

import { checkCodeAction, updateWarrantyAction } from "../_apis/actions";
import type { AdminWarranty } from "../_apis/types";
import {
  type UpdateWarrantyForm,
  WARRANTY_STATUS_OPTIONS,
  monthsToYears,
  parseToothPositions,
  updateWarrantySchema,
  yearsToMonths,
} from "../_lib/const";

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function toForm(item: AdminWarranty): UpdateWarrantyForm {
  return {
    code: item.code,
    customer_name: item.customer_name,
    clinic_name: item.clinic_name,
    lab_name: item.lab_name,
    tooth_positions: item.tooth_positions.join(", "),
    warranty_years: monthsToYears(item.warranty_months),
    issue_date: item.issue_date,
    status: item.status,
    note: item.note ?? "",
  };
}

export function EditWarrantyDialog({ item }: { item: AdminWarranty }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateWarrantyForm>({
    resolver: zodResolver(updateWarrantySchema),
    defaultValues: toForm(item),
  });

  /** Trùng = mã có đổi so với hiện tại VÀ đã tồn tại ở thẻ khác. */
  async function isDuplicate(code: string): Promise<boolean> {
    const trimmed = code.trim();
    if (!trimmed || trimmed === item.code) return false;
    setChecking(true);
    try {
      const { exists } = await checkCodeAction(trimmed);
      return exists;
    } catch {
      return false;
    } finally {
      setChecking(false);
    }
  }

  async function onCodeBlur(e: React.FocusEvent<HTMLInputElement>) {
    const code = e.target.value.trim();
    if (!code) return;
    if (await isDuplicate(code)) {
      setError("code", { type: "manual", message: "Mã thẻ đã tồn tại" });
    } else {
      clearErrors("code");
    }
  }

  function onSubmit(values: UpdateWarrantyForm) {
    startTransition(async () => {
      if (await isDuplicate(values.code)) {
        setError("code", { type: "manual", message: "Mã thẻ đã tồn tại" });
        return;
      }
      const { warranty_years, ...rest } = values;
      const res = await updateWarrantyAction(item.id, {
        ...rest,
        tooth_positions: parseToothPositions(values.tooth_positions),
        warranty_months: yearsToMonths(warranty_years),
      });
      if (res.success) {
        toast.success("Đã cập nhật thẻ");
        setOpen(false);
        router.refresh();
      } else if (res.error === "CODE_DUPLICATED") {
        setError("code", { type: "manual", message: "Mã thẻ đã tồn tại" });
      } else {
        toast.error(errorMessage(res.error));
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Mỗi lần mở lại đồng bộ form với dữ liệu mới nhất của dòng.
        if (next) reset(toForm(item));
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
          Sửa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Sửa thẻ {item.code}</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin thẻ bảo hành. Ngày hết hạn được tính lại theo số
            năm bảo hành.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Field label="Mã bảo hành" required error={errors.code?.message}>
              <Input {...register("code", { onBlur: onCodeBlur })} />
              {checking ? (
                <p className="text-xs text-muted-foreground">
                  Đang kiểm tra mã...
                </p>
              ) : null}
            </Field>
          </div>
          <Field
            label="Tên khách hàng"
            required
            error={errors.customer_name?.message}
          >
            <Input {...register("customer_name")} />
          </Field>
          <Field label="Nha khoa" required error={errors.clinic_name?.message}>
            <Input {...register("clinic_name")} placeholder="VD: Nha khoa Smile" />
          </Field>
          <Field label="Lab" required error={errors.lab_name?.message}>
            <Input {...register("lab_name")} />
          </Field>
          <Field
            label="Số năm bảo hành"
            required
            error={errors.warranty_years?.message}
          >
            <Input type="number" min={1} {...register("warranty_years")} />
          </Field>
          <Field label="Ngày phát hành" required error={errors.issue_date?.message}>
            <DatePicker
              value={watch("issue_date")}
              onChange={(v) =>
                setValue("issue_date", v, { shouldValidate: true })
              }
              placeholder="Chọn ngày phát hành"
            />
          </Field>
          <Field label="Trạng thái" required error={errors.status?.message}>
            <select className={cn(SELECT_CLASS)} {...register("status")}>
              {WARRANTY_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Vị trí răng (cách nhau bởi dấu phẩy)"
              required
              error={errors.tooth_positions?.message}
            >
              <Input {...register("tooth_positions")} placeholder="11, 12, 21" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Ghi chú" error={errors.note?.message}>
              <Textarea {...register("note")} rows={2} />
            </Field>
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={pending || checking}>
              {pending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
