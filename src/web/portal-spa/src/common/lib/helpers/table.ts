import { type Row } from "@tanstack/react-table";

export const localeAlphanumericSort = <T>(
  rowA: Row<T>,
  rowB: Row<T>,
  columnId: string,
) => {
  const valueA = rowA.getValue(columnId) ?? "";
  const valueB = rowB.getValue(columnId) ?? "";

  if (typeof valueA === "string" && typeof valueB === "string") {
    if (valueA.toLowerCase() === valueB.toLowerCase()) {
      return valueA.localeCompare(valueB, "vi", { sensitivity: "case" });
    }

    return valueA.localeCompare(valueB, "vi", { sensitivity: "base" });
  }
  if (typeof valueA === "number" && typeof valueB === "number") {
    return valueA - valueB;
  }

  return 0;
};

export const splitRowNumber = (rowNumber: string) => {
  return rowNumber.replace(/(.{4})/g, "$1<br>");
};
