import cronstrue from "cronstrue/i18n";

const FIELD_FULL_RANGES: { min: number; max: number }[] = [
  { min: 0, max: 59 }, // minute
  { min: 0, max: 23 }, // hour
  { min: 1, max: 31 }, // day-of-month
  { min: 1, max: 12 }, // month
  { min: 0, max: 6 }, // day-of-week
];

function normalizeField(field: string, index: number): string {
  if (field === "*") return "*";
  if (field === "*/1") return "*";

  const range = FIELD_FULL_RANGES[index];
  if (range) {
    const match = /^(\d+)-(\d+)$/.exec(field);
    if (match) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      if (start === range.min && end === range.max) return "*";
    }
  }
  return field;
}

function normalizeCronExpression(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return expression;
  return parts.map((p, i) => normalizeField(p, i)).join(" ");
}

// Không ràng buộc ngày trong tháng / tháng / thứ → lịch chạy hằng ngày
function hasNoDateRestriction(expression: string): boolean {
  const parts = expression.split(" ");
  return parts.length === 5 && parts.slice(2).every((p) => p === "*");
}

function fixVietnameseDescription(text: string): string {
  let result = text
    // "Phút thứ X qua Y tiếng" → "Từ phút X đến phút Y" (hour clause handled separately)
    .replace(/Phút thứ (\d+) qua (\d+) tiếng/gi, "Từ phút $1 đến phút $2")
    // "chỉ trên Thứ N" / "chỉ trên Chủ nhật" → "Mỗi Thứ N" / "Mỗi Chủ nhật"
    .replace(/chỉ trên\b/gi, "Mỗi")
    // "Vào N phút của mỗi tiếng" → "Vào phút N của mỗi tiếng"
    .replace(/Vào (\d+) phút của mỗi tiếng/gi, "Vào phút $1 của mỗi tiếng")
    // English "and" leaked from cronstrue locale → "và"
    .replace(/\band\b/g, "và")
    // Khoảng "từ - đến": "Tháng 4 đến Tháng 5" → "từ Tháng 4 đến Tháng 5",
    // "giữa ngày 3 và 5 trong tháng" → "trong khoảng thời gian từ ngày thứ 3
    // đến ngày thứ 5 của tháng", "Thứ 2 đến Thứ 6" → "từ Thứ 2 đến Thứ 6".
    .replace(/Tháng (\d+) đến Tháng (\d+)/g, "từ Tháng $1 đến Tháng $2")
    .replace(
      /giữa ngày (\d+) và (\d+) trong tháng/gi,
      "trong khoảng thời gian từ ngày thứ $1 đến ngày thứ $2 của tháng",
    )
    // Khoảng thứ vắt qua tuần (vd 3-1: Thứ 4 → Thứ 2) thì thêm "tuần sau".
    // Vị trí trong tuần tính từ Thứ 2 (1) đến Chủ nhật (7).
    .replace(
      /(Thứ \d|Chủ nhật) đến (Thứ \d|Chủ nhật)/g,
      (_match, from: string, to: string) => {
        const pos = (label: string) =>
          label === "Chủ nhật" ? 7 : Number(label.slice(4));
        const suffix = pos(from) > pos(to) ? " tuần sau" : "";
        return `từ ${from} đến ${to}${suffix}`;
      },
    )
    // "vào 5 ngày trong tháng" → "ngày 05" (pad 2 chữ số)
    .replace(
      /vào ([\d, và]+?) ngày trong tháng/g,
      (_match, days: string) =>
        `ngày ${days.replace(/\d+/g, (d) => d.padStart(2, "0"))}`,
    )
    // "ngày 05, chỉ trong Tháng 3" → "ngày 05 và chỉ trong Tháng 3"
    .replace(
      /(ngày \d{2}(?:(?:,| và|, và) \d{2})*), (chỉ trong|từ Tháng)/g,
      "$1 và $2",
    )
    // Bước nhảy tháng (*/N): cronstrue vi chỉ nối cụt " N tháng" vào cuối
    // → ", cứ N tháng một lần".
    .replace(/,? (\d+) tháng$/, ", cứ $1 tháng một lần");

  // Có ngày trong tháng nhưng không ràng buộc tháng → thêm "hằng tháng"
  if (/, ngày \d{2}/.test(result) && !/tháng/i.test(result)) {
    result = result.replace(
      /(, ngày \d{2}(?:(?:,| và|, và) \d{2})*)/,
      "$1 hằng tháng",
    );
  }

  // If minute range exists but no hour info ("giữa HH:MM"), append "của mỗi tiếng"
  if (
    /Từ phút \d+ đến phút \d+/.test(result) &&
    !/giữa \d{2}:\d{2}/.test(result)
  ) {
    result = result.replace(/(Từ phút \d+ đến phút \d+)/, "$1 của mỗi tiếng");
  }
  return result;
}

export const describeCronExpression = (
  expression: string,
  locale = "vi",
): string => {
  if (!expression) return "";
  try {
    const normalized = normalizeCronExpression(expression);
    const raw = cronstrue.toString(normalized, {
      locale,
      use24HourTimeFormat: true,
      verbose: false,
      throwExceptionOnParseError: true,
    });
    const description = locale === "vi" ? fixVietnameseDescription(raw) : raw;
    if (hasNoDateRestriction(normalized)) {
      return locale === "vi"
        ? `${description} hằng ngày`
        : `${description}, every day`;
    }
    return description;
  } catch {
    return "";
  }
};
