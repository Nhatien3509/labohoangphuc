import CategoriesTable from "@/app/[locale]/(dashboard)/admin/categories/_components/CategoriesTable";
import { DEFAULT_PAGE_SIZE } from "@/app/[locale]/(dashboard)/admin/categories/_lib/const";
import { getCategoryList } from "@/app/[locale]/(dashboard)/admin/categories/_apis/server";

type SearchParams = {
  page?: string;
  pageSize?: string;
  search?: string;
  status?: string;
  softwareType?: string;
  fromDate?: string;
  toDate?: string;
};

export default async function CategoriesPage({
  searchParams,
}: Readonly<{ searchParams: SearchParams }>) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const pageSize = Number(searchParams.pageSize ?? DEFAULT_PAGE_SIZE);
  const search = searchParams.search ?? "";
  const status = searchParams.status ?? "";
  const softwareType = searchParams.softwareType ?? "";
  const fromDate = searchParams.fromDate ?? "";
  const toDate = searchParams.toDate ?? "";

  const { items, total } = await getCategoryList({
    page,
    pageSize,
    search,
    status,
    softwareType,
    fromDate,
    toDate,
  });

  return (
    <CategoriesTable
      items={items}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      status={status}
      softwareType={softwareType}
      fromDate={fromDate}
      toDate={toDate}
    />
  );
}
