// L2 · Skill template — page.tsx vỏ mỏng cho module mới.
// Thay <Module> bằng tên thật.
import ModuleTable from "@/app/[locale]/(dashboard)/admin/<module>/_components/ModuleTable";
import { DEFAULT_PAGE_SIZE } from "@/app/[locale]/(dashboard)/admin/<module>/_lib/const";
import { getList } from "@/app/[locale]/(dashboard)/admin/<module>/_apis/server";

type SearchParams = { page?: string; pageSize?: string; search?: string };

export default async function ModulePage({
  searchParams,
}: Readonly<{ searchParams: SearchParams }>) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const pageSize = Number(searchParams.pageSize ?? DEFAULT_PAGE_SIZE);
  const search = searchParams.search ?? "";

  const { items, total } = await getList({ page, pageSize, search });

  return (
    <ModuleTable
      items={items}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
    />
  );
}
