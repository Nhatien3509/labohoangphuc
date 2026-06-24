import { SiteFooter } from "@common/components/layout/SiteFooter";
import { SiteHeader } from "@common/components/layout/SiteHeader";

/** Khung công khai (khách vãng lai): thanh điều hướng cố định + chân trang. */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pt-20">{children}</main>
      <SiteFooter />
    </div>
  );
}
