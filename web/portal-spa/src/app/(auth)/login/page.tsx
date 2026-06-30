import { redirect } from "next/navigation";

import { isAuthenticated } from "@/api/session";

import { LoginForm } from "./_components/LoginForm";

export const dynamic = "force-dynamic";

/** Trang đăng nhập. Đã đăng nhập thì chuyển thẳng vào khu quản trị. */
export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = searchParams?.next;
  const redirectTo = next?.startsWith("/") ? next : "/admin";

  if (isAuthenticated()) {
    redirect(redirectTo);
  }

  return <LoginForm redirectTo={redirectTo} />;
}
