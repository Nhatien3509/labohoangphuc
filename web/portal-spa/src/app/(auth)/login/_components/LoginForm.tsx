"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { loginAction } from "@common/auth/actions";
import { Button } from "@common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@common/components/ui/dialog";
import { Input } from "@common/components/ui/input";
import { Label } from "@common/components/ui/label";

import { type LoginForm as LoginFormValues, loginSchema } from "../_lib/const";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(values: LoginFormValues) {
    startTransition(async () => {
      const res = await loginAction(values);
      if (res.success) {
        toast.success("Đăng nhập thành công");
        router.replace(redirectTo);
        router.refresh();
      } else {
        toast.error(res.error ?? "Đăng nhập thất bại");
      }
    });
  }

  return (
    <div className="w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Đăng nhập quản trị</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Vui lòng nhập thông tin đăng nhập của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email<span className="text-destructive"> *</span>
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="username"
              className="pl-10"
              placeholder="Nhập email"
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">
            Mật khẩu<span className="text-destructive"> *</span>
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              className="pl-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-brand"
          />
          Ghi nhớ đăng nhập
        </label>

        <Button
          type="submit"
          disabled={pending}
          className="w-full gap-2 bg-gradient-to-r from-brand to-brand-dark shadow-md hover:from-brand-dark hover:to-brand-dark"
        >
          {pending ? "Đang đăng nhập..." : "Đăng nhập"}
          {!pending ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Cần hỗ trợ?{" "}
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="font-semibold text-brand hover:underline"
            >
              Liên hệ quản trị viên
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            {/* Hồ sơ quản trị viên */}
            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white shadow-md">
                <User className="h-10 w-10" />
              </span>
              <DialogTitle className="mt-4 text-xl">
                Trịnh Nhã Tiến
              </DialogTitle>
              <DialogDescription>Quản trị viên hệ thống</DialogDescription>
            </div>

            <div className="mt-2 space-y-3 border-t border-border pt-4">
              <a
                href="tel:0975450300"
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/60"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-500 text-white">
                  <Phone className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">
                    Số điện thoại
                  </span>
                  <span className="block font-semibold text-foreground">
                    0975 450 300
                  </span>
                </span>
              </a>
              <a
                href="mailto:nhatien.work@gmail.com"
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/60"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">
                    Email
                  </span>
                  <span className="block break-all font-semibold text-foreground">
                    nhatien.work@gmail.com
                  </span>
                </span>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </p>
    </div>
  );
}
