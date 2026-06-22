"use client";

import { Select, Tooltip } from "antd";
import type { CSSProperties } from "react";

// Select "hệ thống nguồn / hệ thống kết nối" dùng chung:
// - Mỗi option 2 dòng: tên hệ thống + dòng phụ "Mã: <code>, Viết tắt: <shortName>".
// - Ô đã chọn hiển thị "Tên (Mã)", dài quá thì cắt "..." + tooltip đầy đủ.
// - Tìm kiếm lọc theo tên + mã + tên viết tắt.
// - `value` nhận cả number (id, mặc định) lẫn string; disable được từng option.
// BE (ConnectedSystem) trả: Name, ShortName, SoftwareCode (→ mã). camelize-ts ra
// name/shortName/softwareCode — callsite map về { label, code, shortName }.
export type ConnectedSystemOption<V extends string | number = number> =
  Readonly<{
    value: V;
    label: string; // tên hệ thống
    code?: string; // mã phần mềm (SoftwareCode)
    shortName?: string; // tên viết tắt
    disabled?: boolean;
  }>;

type Props<V extends string | number> = Readonly<{
  value?: V;
  onChange: (value?: V) => void;
  options: readonly ConnectedSystemOption<V>[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  className?: string;
  style?: CSSProperties;
}>;

// "Mã: x, Viết tắt: y" — bỏ phần thiếu.
function metaLine(code?: string, shortName?: string): string {
  return [code ? `Mã: ${code}` : "", shortName ? `Viết tắt: ${shortName}` : ""]
    .filter(Boolean)
    .join(", ");
}

// "Tên (Mã)" cho ô đã chọn + tooltip.
function selectedText(o?: ConnectedSystemOption<string | number>): string {
  if (!o) return "";
  return o.code ? `${o.label} (${o.code})` : o.label;
}

export default function ConnectedSystemSelect<
  V extends string | number = number,
>({
  value,
  onChange,
  options,
  placeholder = "Chọn hệ thống nguồn",
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
              String(option?.shortName ?? "")
                .toLowerCase()
                .includes(q)
            );
          },
        }}
        options={options.map((o) => ({
          value: o.value,
          label: o.label,
          code: o.code,
          shortName: o.shortName,
          disabled: o.disabled,
        }))}
        optionRender={(opt) => {
          const data = opt.data as ConnectedSystemOption<V>;
          const meta = metaLine(data.code, data.shortName);
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
