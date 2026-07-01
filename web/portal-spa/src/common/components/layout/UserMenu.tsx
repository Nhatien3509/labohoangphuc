"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { changePasswordAction, logoutAction } from "@common/auth/actions";
import {
  type ChangePasswordForm,
  changePasswordSchema,
} from "@common/auth/password";
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

function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  function onSubmit(values: ChangePasswordForm) {
    startTransition(async () => {
      const res = await changePasswordAction({
        old_password: values.old_password,
        new_password: values.new_password,
      });
      if (res.success) {
        toast.success("Đổi mật khẩu thành công");
        reset();
        setOpen(false);
      } else {
        toast.error(res.error ?? "Đổi mật khẩu thất bại");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Đổi mật khẩu">
          <KeyRound className="h-4 w-4" />
          <span className="hidden sm:inline">Đổi mật khẩu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Mật khẩu mới tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số và ký
            tự đặc biệt.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="old_password">
              Mật khẩu hiện tại<span className="text-destructive"> *</span>
            </Label>
            <Input
              id="old_password"
              type="password"
              autoComplete="current-password"
              {...register("old_password")}
            />
            {errors.old_password ? (
              <p className="text-xs text-destructive">
                {errors.old_password.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password">
              Mật khẩu mới<span className="text-destructive"> *</span>
            </Label>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              {...register("new_password")}
            />
            {errors.new_password ? (
              <p className="text-xs text-destructive">
                {errors.new_password.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">
              Xác nhận mật khẩu mới<span className="text-destructive"> *</span>
            </Label>
            <Input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              {...register("confirm_password")}
            />
            {errors.confirm_password ? (
              <p className="text-xs text-destructive">
                {errors.confirm_password.message}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UserMenu({ role }: { role?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onLogout() {
    startTransition(async () => {
      await logoutAction();
      toast.success("Đã đăng xuất");
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {role ? (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {role}
        </span>
      ) : null}
      <ChangePasswordDialog />
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        disabled={pending}
        title="Đăng xuất"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">
          {pending ? "Đang thoát..." : "Đăng xuất"}
        </span>
      </Button>
    </div>
  );
}
