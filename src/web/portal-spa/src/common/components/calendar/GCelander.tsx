"use client";

import dayjs, { type Dayjs } from "dayjs";
import { DatePicker } from "antd";

type Props = Readonly<{
  value?: string;
  onChange?: (iso: string) => void;
  placeholder?: string;
  format?: string;
  className?: string;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
  allowClear?: boolean;
  style?: React.CSSProperties;
  /** ISO date string; dates before this are disabled. */
  minDate?: string;
  /** ISO date string; dates after this are disabled. */
  maxDate?: string;
}>;

const ISO_FORMAT = "YYYY-MM-DD";

export default function GCelander({
  value,
  onChange,
  placeholder,
  format = "DD/MM/YYYY",
  className,
  size = "middle",
  disabled = false,
  allowClear = true,
  style,
  minDate,
  maxDate,
}: Props) {
  const parsed = value ? dayjs(value) : null;
  const dayjsValue: Dayjs | null = parsed?.isValid() ? parsed : null;

  const min = minDate ? dayjs(minDate) : null;
  const max = maxDate ? dayjs(maxDate) : null;
  const hasBounds = !!min?.isValid() || !!max?.isValid();
  const disabledDate = hasBounds
    ? (current: Dayjs) =>
        (min?.isValid() ? current.isBefore(min, "day") : false) ||
        (max?.isValid() ? current.isAfter(max, "day") : false)
    : undefined;

  return (
    <DatePicker
      value={dayjsValue}
      onChange={(d) => {
        onChange?.(d ? d.format(ISO_FORMAT) : "");
      }}
      placeholder={placeholder}
      format={format}
      className={className}
      size={size}
      disabled={disabled}
      allowClear={allowClear}
      style={style}
      disabledDate={disabledDate}
    />
  );
}
