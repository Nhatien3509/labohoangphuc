import { z } from "zod";

/** Schema form đăng nhập (khớp ràng buộc binding của BE: email, min 6 ký tự). */
export const loginSchema = z.object({
  email: z.string().min(1, "Bắt buộc nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export type LoginForm = z.infer<typeof loginSchema>;
