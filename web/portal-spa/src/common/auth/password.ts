import { z } from "zod";

/** Quy tắc mật khẩu mạnh — khớp ValidateSecurePassword ở backend (auth_middleware.go). */
const securePassword = z
  .string()
  .min(8, "Mật khẩu tối thiểu 8 ký tự")
  .regex(/[A-Z]/, "Phải có ít nhất 1 chữ hoa")
  .regex(/[a-z]/, "Phải có ít nhất 1 chữ thường")
  .regex(/[0-9]/, "Phải có ít nhất 1 chữ số")
  .regex(/[!@#$%^&*_+\-[\]{};:,.? ]/, "Phải có ít nhất 1 ký tự đặc biệt");

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(6, "Mật khẩu cũ tối thiểu 6 ký tự"),
    new_password: securePassword,
    confirm_password: z.string().min(1, "Bắt buộc xác nhận mật khẩu"),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    path: ["confirm_password"],
    message: "Xác nhận mật khẩu không khớp",
  });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
