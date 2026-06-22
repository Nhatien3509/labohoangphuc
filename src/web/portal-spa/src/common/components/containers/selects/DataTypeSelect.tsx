"use client";

import { Select, Tooltip } from "antd";
import type { CSSProperties } from "react";

// Select "loại dữ liệu" dùng chung:
// - Mỗi option 2 dòng: tên loại + dòng phụ "Mã: <code>, Nguồn: <source>".
// - Ô đã chọn hiển thị "Tên (Mã - Nguồn)", dài quá thì cắt "..." + tooltip đầy đủ
//   (Tooltip bọc cả Select vì ô search của antd phủ lên vùng giá trị).
// - Tìm kiếm lọc theo tên + mã + nguồn.
// - `value` nhận cả string lẫn number (vd id), có thể disable từng option.
export type DataTypeOption<V extends string | number = string> = Readonly<{
  value: V;
  label: string; // tên loại dữ liệu
  code?: string; // mã loại dữ liệu
  source?: string; // mã/nguồn dữ liệu
  disabled?: boolean;
}>;

type Props<V extends string | number> = Readonly<{
  value?: V;
  onChange: (value?: V) => void;
  options: readonly DataTypeOption<V>[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  className?: string;
  style?: CSSProperties;
}>;

// "Mã: x, Nguồn: y" — bỏ phần thiếu.
function metaLine(code?: string, source?: string): string {
  return [code ? `Mã: ${code}` : "", source ? `Nguồn: ${source}` : ""]
    .filter(Boolean)
    .join(", ");
}

// "Tên (mã - nguồn)" cho ô đã chọn + tooltip.
function selectedText(o?: DataTypeOption<string | number>): string {
  if (!o) return "";
  const meta = [o.code, o.source].filter(Boolean).join(" - ");
  return meta ? `${o.label} (${meta})` : o.label;
}

export default function DataTypeSelect<V extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = "Chọn loại dữ liệu",
  disabled,
  loading,
  allowClear,
  className,
  style = { width: "100%", height: 36 },
}: Props<V>) {
  const selected = options.find((o) => o.value === value);

  return (
    <Tooltip title={selectedText(selected)} placement="topLeft">
      <Select<V>
        value={typeof value === "string" && value === "" ? undefined : value}
        placeholder={placeholder}
        onChange={(v) => {
          onChange(v);
        }}
        disabled={disabled}
        loading={loading}
        allowClear={allowClear}
        className={className}
        style={style}
        showSearch={{
          filterOption: (input, option) => {
            const q = input.toLowerCase();
            return (
              String(option?.label ?? "")
                .toLowerCase()
                .includes(q) ||
              String(option?.code ?? "")
                .toLowerCase()
                .includes(q) ||
              String(option?.source ?? "")
                .toLowerCase()
                .includes(q)
            );
          },
        }}
        options={options.map((o) => ({
          value: o.value,
          label: o.label,
          code: o.code,
          source: o.source,
          disabled: o.disabled,
        }))}
        optionRender={(opt) => {
          const data = opt.data as DataTypeOption<V>;
          const meta = metaLine(data.code, data.source);
          return (
            <div className="flex flex-col leading-tight">
              <span>{data.label}</span>
              {meta && (
                <span className="text-[11px] text-neutral-500 dark:text-neutral-dark-500">
                  {meta}
                </span>
              )}
            </div>
          );
        }}
        labelRender={(props) => (
          <span className="block truncate">
            {selectedText(
              options.find((o) => String(o.value) === String(props.value)),
            )}
          </span>
        )}
      />
    </Tooltip>
  );
}
