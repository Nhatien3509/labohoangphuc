import { redirect } from "next/navigation";

// Trang chủ đưa về feature mẫu (Danh mục).
// (sau khi đăng nhập hoặc khi bấm logo đều rơi về "/").
export default function HomePage() {
  redirect("/admin/categories");
}
