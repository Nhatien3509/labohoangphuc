"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
import { Input } from "@common/components/ui/input";
import { Label } from "@common/components/ui/label";
import { Textarea } from "@common/components/ui/textarea";
import { errorMessage } from "@common/lib/helpers/warranty";

import { createWarrantyAction } from "../_apis/actions";
import {
  type CreateWarrantyForm,
  DEFAULT_LAB_NAME,
  createWarrantySchema,
  parseToothPositions,
} from "../_lib/const";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function CreateWarrantyDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWarrantyForm>({
    resolver: zodResolver(createWarrantySchema),
    defaultValues: { lab_name: DEFAULT_LAB_NAME },
  });

  function onSubmit(values: CreateWarrantyForm) {
    startTransition(async () => {
      const res = await createWarrantyAction({
        ...values,
        tooth_positions: parseToothPositions(values.tooth_positions),
      });
      if (res.success) {
        toast.success(`Đã tạo thẻ ${res.data?.code ?? ""}`);
        reset({ lab_name: DEFAULT_LAB_NAME });
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
        <Button>
          <Plus className="h-4 w-4" />
          Phát hành thẻ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Phát hành thẻ bảo hành</DialogTitle>
          <DialogDescription>
            Nhập thông tin khách hàng và sản phẩm để tạo thẻ mới.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Field label="Tên khách hàng" error={errors.customer_name?.message}>
            <Input {...register("customer_name")} />
          </Field>
          <Field label="Số điện thoại" error={errors.customer_phone?.message}>
            <Input {...register("customer_phone")} />
          </Field>
          <Field label="Clinic ID (UUID)" error={errors.clinic_id?.message}>
            <Input {...register("clinic_id")} placeholder="xxxxxxxx-xxxx-..." />
          </Field>
          <Field label="Product ID (UUID)" error={errors.product_id?.message}>
            <Input {...register("product_id")} placeholder="xxxxxxxx-xxxx-..." />
          </Field>
          <Field label="Lab" error={errors.lab_name?.message}>
            <Input {...register("lab_name")} />
          </Field>
          <Field label="Ngày phát hành" error={errors.issue_date?.message}>
            <Input type="date" {...register("issue_date")} />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Vị trí răng (cách nhau bởi dấu phẩy)"
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Đang tạo..." : "Tạo thẻ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
