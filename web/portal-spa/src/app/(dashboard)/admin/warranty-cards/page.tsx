import { listWarranties } from "./_apis/server";
import { CreateWarrantyDialog } from "./_components/CreateWarrantyDialog";
import { WarrantyTable } from "./_components/WarrantyTable";

// Trang đọc dữ liệu sống từ backend ở mỗi request — không prerender tĩnh.
export const dynamic = "force-dynamic";

export default async function WarrantyCardsPage() {
  const res = await listWarranties();
  const items = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Thẻ bảo hành</h1>
          <p className="text-sm text-muted-foreground">
            Danh sách và phát hành thẻ bảo hành.
          </p>
        </div>
        <CreateWarrantyDialog />
      </div>

      <WarrantyTable items={items} />
    </div>
  );
}
