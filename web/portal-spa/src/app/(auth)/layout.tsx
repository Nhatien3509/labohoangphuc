import { ShieldCheck } from "lucide-react";

/** Khung tối giản cho trang xác thực: căn giữa, không sidebar/header. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
        <ShieldCheck className="h-6 w-6 text-primary" />
        Labo Hoàng Phúc
      </div>
      {children}
    </div>
  );
}
