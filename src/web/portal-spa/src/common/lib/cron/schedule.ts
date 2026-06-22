// Bộ tiện ích cho UI dựng lịch chạy (tab "Thiết lập thời gian"): trạng thái
// 5 cột Phút/Giờ/Ngày/Tháng/Thứ, các option dropdown, rule ẩn/khóa theo tần
// suất và chuyển trạng thái cột → token cron.

export type ScheduleMode = "schedule" | "cron";

export type ScheduleFieldKey = "minute" | "hour" | "day" | "month" | "weekday";

export type ScheduleFieldState = {
  mode: string;
  value: number | undefined;
  valueTo: number | undefined;
};

export const SCHEDULE_FIELD_LABELS: Record<ScheduleFieldKey, string> = {
  minute: "Phút",
  hour: "Giờ",
  day: "Ngày",
  month: "Tháng",
  weekday: "Thứ",
};

function buildScheduleModeOptions(noun: string) {
  return [
    { value: "range", label: `Từ ${noun}` },
    { value: "step", label: `Hằng ${noun}` },
    { value: "specific", label: `Cụ thể ${noun}` },
  ];
}

export const SCHEDULE_MODE_OPTIONS: Record<
  ScheduleFieldKey,
  { value: string; label: string }[]
> = {
  // Phút và giờ không hỗ trợ khoảng "Từ ..." — chỉ Hằng / Cụ thể.
  minute: buildScheduleModeOptions("phút").filter((o) => o.value !== "range"),
  hour: buildScheduleModeOptions("giờ").filter((o) => o.value !== "range"),
  day: buildScheduleModeOptions("ngày"),
  month: buildScheduleModeOptions("tháng"),
  // Thứ không hỗ trợ "Hằng thứ" — chỉ Từ / Cụ thể.
  weekday: buildScheduleModeOptions("thứ").filter((o) => o.value !== "step"),
};

// Định kỳ ngày ẩn cụm Thứ, Định kỳ tuần ẩn cụm Ngày; cả hai đều ẩn cụm Tháng.
// Thời gian cụ thể ẩn cụm Thứ.
export function isClusterHidden(preset: string, key: ScheduleFieldKey) {
  if (preset === "specific_time") return key === "weekday";
  if (preset !== "daily" && preset !== "weekly") return false;
  if (key === "month") return true;
  return preset === "daily" ? key === "weekday" : key === "day";
}

// Định kỳ ngày / tuần / tháng: phút và giờ khóa chế độ ở "Cụ thể", chỉ chọn
// giá trị. Thời gian cụ thể: khóa chế độ ở "Cụ thể" trên mọi cột.
export function isModeLocked(preset: string, key: ScheduleFieldKey) {
  if (preset === "specific_time") return true;
  return (
    (preset === "daily" || preset === "weekly" || preset === "monthly") &&
    (key === "minute" || key === "hour")
  );
}

export const SCHEDULE_WEEKDAY_OPTIONS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

function rangeOptions(min: number, max: number) {
  return Array.from({ length: max - min + 1 }, (_, i) => ({
    value: min + i,
    label: String(min + i).padStart(2, "0"),
  }));
}

// Dropdown giá trị cho từng cột trong phần Cài đặt (Theo lịch).
export const SCHEDULE_VALUE_OPTIONS: Record<
  ScheduleFieldKey,
  { value: number; label: string }[]
> = {
  minute: rangeOptions(0, 59),
  hour: rangeOptions(0, 23),
  day: rangeOptions(1, 31),
  month: rangeOptions(1, 12),
  weekday: SCHEDULE_WEEKDAY_OPTIONS,
};

export const SCHEDULE_FIELD_ORDER: ScheduleFieldKey[] = [
  "minute",
  "hour",
  "day",
  "month",
  "weekday",
];

export const DEFAULT_MANUAL_CRON = "0 * * * *";

// Tùy chọn "Tần suất cập nhật" trong tab Thiết lập thời gian.
export const SCHEDULE_FREQUENCY_OPTIONS: { value: string; label: string }[] = [
  { value: "daily", label: "Định kỳ ngày" },
  { value: "weekly", label: "Định kỳ tuần" },
  { value: "monthly", label: "Định kỳ tháng" },
  { value: "specific_time", label: "Thời gian cụ thể" },
];

export const DEFAULT_SCHEDULE_FREQUENCY = "daily";

export function buildDefaultScheduleFields(): Record<
  ScheduleFieldKey,
  ScheduleFieldState
> {
  return {
    // Tần suất mặc định là "Định kỳ ngày" → phút/giờ khóa ở "Cụ thể".
    // Không chọn phút/giờ thì mặc định 00 giờ 00 phút.
    minute: { mode: "specific", value: 0, valueTo: undefined },
    hour: { mode: "specific", value: 0, valueTo: undefined },
    day: { mode: "step", value: undefined, valueTo: undefined },
    month: { mode: "specific", value: undefined, valueTo: undefined },
    weekday: { mode: "specific", value: undefined, valueTo: undefined },
  };
}

export function scheduleFieldToCron(state: ScheduleFieldState): string {
  if (state.mode === "step" && state.value != null && state.value > 0) {
    return `*/${state.value}`;
  }
  if (state.mode === "specific" && state.value != null) {
    return String(state.value);
  }
  if (state.mode === "range" && state.value != null && state.valueTo != null) {
    return `${state.value}-${state.valueTo}`;
  }
  return "*";
}

type ScheduleFields = Record<ScheduleFieldKey, ScheduleFieldState>;

const CLEARED_FIELD: ScheduleFieldState = {
  mode: "specific",
  value: undefined,
  valueTo: undefined,
};

// Áp rule tần suất lên trạng thái các cột:
// - Định kỳ ngày/tuần/tháng + Thời gian cụ thể: phút/giờ khóa ở "Cụ thể".
// - Định kỳ ngày xóa cụm Thứ, Định kỳ tuần xóa cụm Ngày, cả hai xóa Tháng
//   (các cụm bị ẩn — token cron giữ "*").
// - Định kỳ tháng: cột Ngày bỏ "Hằng ngày"; Ngày–Thứ loại trừ nhau (đang có
//   giá trị cả hai thì ưu tiên giữ Ngày).
// - Thời gian cụ thể: mọi cột về "Cụ thể", xóa cụm Thứ.
export function applyFrequencyPreset(
  prev: ScheduleFields,
  preset: string,
): ScheduleFields {
  if (preset === "specific_time") {
    return {
      minute: { ...prev.minute, mode: "specific" },
      hour: { ...prev.hour, mode: "specific" },
      day: { ...prev.day, mode: "specific" },
      month: { ...prev.month, mode: "specific" },
      weekday: CLEARED_FIELD,
    };
  }
  if (preset === "monthly") {
    const next = {
      ...prev,
      minute: { ...prev.minute, mode: "specific" },
      hour: { ...prev.hour, mode: "specific" },
    };
    if (prev.day.mode === "step") {
      next.day = { ...prev.day, mode: "specific" };
    }
    const dayHasValue = prev.day.value != null || prev.day.valueTo != null;
    const weekdayHasValue =
      prev.weekday.value != null || prev.weekday.valueTo != null;
    if (dayHasValue && weekdayHasValue) next.weekday = CLEARED_FIELD;
    return next;
  }
  if (preset !== "daily" && preset !== "weekly") return prev;
  return {
    ...prev,
    minute: { ...prev.minute, mode: "specific" },
    hour: { ...prev.hour, mode: "specific" },
    month: CLEARED_FIELD,
    ...(preset === "daily"
      ? { weekday: CLEARED_FIELD }
      : { day: { mode: "step", value: undefined, valueTo: undefined } }),
  };
}

// Có cột nào ở chế độ "Từ ..." mà chưa chọn đủ hai đầu từ/đến không.
export function hasIncompleteScheduleRange(fields: ScheduleFields): boolean {
  return SCHEDULE_FIELD_ORDER.some((k) => {
    const f = fields[k];
    return f.mode === "range" && (f.value == null || f.valueTo == null);
  });
}

// Định kỳ tháng: Ngày và Thứ loại trừ nhau — bên kia có giá trị thì khóa bên này.
export function isMonthlyMutexDisabled(
  preset: string,
  key: ScheduleFieldKey,
  fields: ScheduleFields,
): boolean {
  if (preset !== "monthly") return false;
  if (key !== "day" && key !== "weekday") return false;
  const other = fields[key === "day" ? "weekday" : "day"];
  return other.value != null || other.valueTo != null;
}

// Option chế độ theo cột, đã áp rule tần suất (Định kỳ tháng: Ngày bỏ "Hằng ngày").
export function getScheduleModeOptions(preset: string, key: ScheduleFieldKey) {
  if (preset === "monthly" && key === "day") {
    return SCHEDULE_MODE_OPTIONS.day.filter((o) => o.value !== "step");
  }
  return SCHEDULE_MODE_OPTIONS[key];
}

// Option giá trị theo cột; ở chế độ "Từ - đến" khóa các option không thỏa
// từ < đến. Riêng Thứ cho phép khoảng vắt qua Chủ nhật (vd 5-0), chỉ chặn
// hai đầu trùng nhau.
export function getScheduleValueOptions(
  key: ScheduleFieldKey,
  which: "value" | "valueTo",
  fields: ScheduleFields,
): { value: number; label: string; disabled?: boolean }[] {
  const limit = which === "value" ? fields[key].valueTo : fields[key].value;
  if (fields[key].mode !== "range" || limit == null) {
    return SCHEDULE_VALUE_OPTIONS[key];
  }
  return SCHEDULE_VALUE_OPTIONS[key].map((o) => {
    let blocked: boolean;
    if (key === "weekday") {
      blocked = o.value === limit;
    } else if (which === "value") {
      blocked = o.value >= limit;
    } else {
      blocked = o.value <= limit;
    }
    return { ...o, disabled: blocked };
  });
}
