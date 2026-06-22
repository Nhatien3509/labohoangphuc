// Lịch chạy mặc định theo chuẩn tần suất ISO 8601 (trường tanSuatCapNhat).
// Cron 5 trường không biểu diễn được chu kỳ nhiều năm và mỗi giây nên map
// gần đúng: R/P2Y..R/P10Y → 00:00 ngày 1/1 hằng năm (BE tự xử lý chu kỳ),
// R/PT1S (cập nhật liên tục) → mỗi phút.
export const CRON_FREQUENCY_PRESETS: {
  value: string;
  label: string;
  cron: string;
}[] = [
  { value: "R/PT1H", label: "Hằng giờ (R/PT1H)", cron: "0 * * * *" },
  { value: "R/P1D", label: "Hằng ngày (R/P1D)", cron: "0 0 * * *" },
  {
    value: "R/P3.5D",
    label: "Nửa tuần một lần (R/P3.5D)",
    cron: "0 0 * * 1,4",
  },
  { value: "R/P1W", label: "Hằng tuần (R/P1W)", cron: "0 0 * * 1" },
  { value: "R/P2W", label: "2 tuần một lần (R/P2W)", cron: "0 0 */14 * *" },
  {
    value: "R/P0.33W",
    label: "3 lần một tuần (R/P0.33W)",
    cron: "0 0 * * 1,3,5",
  },
  {
    value: "R/P0.5M",
    label: "Nửa tháng một lần (R/P0.5M)",
    cron: "0 0 1,15 * *",
  },
  {
    value: "R/P0.33M",
    label: "3 lần một tháng (R/P0.33M)",
    cron: "0 0 1,11,21 * *",
  },
  { value: "R/P1M", label: "Hằng tháng (R/P1M)", cron: "0 0 1 * *" },
  { value: "R/P2M", label: "2 tháng một lần (R/P2M)", cron: "0 0 1 */2 *" },
  { value: "R/P3M", label: "Hằng quý (R/P3M)", cron: "0 0 1 */3 *" },
  { value: "R/P4M", label: "3 lần một năm (R/P4M)", cron: "0 0 1 */4 *" },
  { value: "R/P6M", label: "6 tháng một lần (R/P6M)", cron: "0 0 1 */6 *" },
  { value: "R/P1Y", label: "Hằng năm (R/P1Y)", cron: "0 0 1 1 *" },
  { value: "R/P2Y", label: "2 năm một lần (R/P2Y)", cron: "0 0 1 1 *" },
  { value: "R/P3Y", label: "3 năm một lần (R/P3Y)", cron: "0 0 1 1 *" },
  { value: "R/P4Y", label: "4 năm một lần (R/P4Y)", cron: "0 0 1 1 *" },
  { value: "R/P10Y", label: "10 năm một lần (R/P10Y)", cron: "0 0 1 1 *" },
  { value: "R/PT1S", label: "Cập nhật liên tục (R/PT1S)", cron: "* * * * *" },
];

export const DEFAULT_CRON_FREQUENCY_PRESET = "R/PT1H";
