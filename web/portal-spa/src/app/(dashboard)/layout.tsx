import { AppHeader } from "@common/components/layout/AppHeader";
import { AppSidebar } from "@common/components/layout/AppSidebar";

/** Khung (dashboard): sidebar trái + header trên. Mọi route admin nằm trong nhóm này. */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
