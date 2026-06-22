import { base10Int } from "@common/lib/helpers/str";

// Inlined from deleted cloud-observability/types
type PrometheusSeriesQueryParams = {
  match?: string[];
  start?: number;
  end?: number;
};

export type SearchParams = Record<string, string | string[] | undefined>;
export type DefaultParams = Record<
  string,
  string | (string | number)[] | number | boolean
>;

const buildQueryParams = <T extends DefaultParams>(
  searchParams: SearchParams,
  defaultParams: T,
) => {
  const result: DefaultParams = {};

  for (const key in defaultParams) {
    const defaultValue = defaultParams[key];
    const value = searchParams[key] ?? defaultValue;

    if (value)
      result[key] =
        typeof defaultValue === "number"
          ? base10Int(value.toString(), defaultValue)
          : value;
  }

  if (
    result.filterBy &&
    typeof result.filterBy === "string" &&
    result.searchValue
  ) {
    result[result.filterBy] = result.searchValue;
  }

  return result as T;
};

function buildPromSeriesQuery(params: PrometheusSeriesQueryParams): string {
  const parts: string[] = [];

  if (params.match?.length) {
    parts.push(...params.match.filter(Boolean).map((m) => `match[]=${m}`));
  }

  if (params.start !== undefined) {
    parts.push(`start=${params.start}`);
  }

  if (params.end !== undefined) {
    parts.push(`end=${params.end}`);
  }

  return parts.length ? `?${parts.join("&")}` : "";
}

export { buildQueryParams, buildPromSeriesQuery };
