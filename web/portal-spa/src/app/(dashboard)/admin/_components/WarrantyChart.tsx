import type { WarrantyMonthlyStat } from "../_apis/types";

/** "2026-07" -> "07/26" */
function shortMonth(ym: string): string {
  const [y = "", m = ""] = ym.split("-");
  return `${m}/${y.slice(2)}`;
}

/**
 * Biểu đồ kết hợp: cột = số thẻ tạo mới mỗi tháng, đường = tổng số thẻ luỹ kế.
 * Thuần SVG (không phụ thuộc thư viện), responsive theo viewBox.
 */
export function WarrantyChart({ data }: { data: WarrantyMonthlyStat[] }) {
  const W = 760;
  const H = 300;
  const padL = 16;
  const padR = 16;
  const padT = 24;
  const padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const n = Math.max(1, data.length);
  const step = plotW / n;
  const barW = Math.min(32, step * 0.5);
  const maxNew = Math.max(1, ...data.map((d) => d.new));
  const maxTotal = Math.max(1, ...data.map((d) => d.total));

  const cx = (i: number) => padL + i * step + step / 2;
  const yBar = (v: number) => padT + plotH - (v / maxNew) * plotH;
  const yLine = (v: number) => padT + plotH - (v / maxTotal) * plotH;

  const linePoints = data
    .map((d, i) => `${cx(i)},${yLine(d.total)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Biểu đồ thẻ bảo hành theo tháng"
    >
      {/* Lưới ngang */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const gy = padT + plotH * t;
        return (
          <line
            key={t}
            x1={padL}
            y1={gy}
            x2={W - padR}
            y2={gy}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray={t === 1 ? "0" : "3 3"}
          />
        );
      })}

      {/* Cột: thẻ tạo mới */}
      {data.map((d, i) =>
        d.new > 0 ? (
          <g key={`bar-${d.month}`}>
            <rect
              x={cx(i) - barW / 2}
              y={yBar(d.new)}
              width={barW}
              height={padT + plotH - yBar(d.new)}
              rx={4}
              className="fill-brand"
            >
              <title>{`${shortMonth(d.month)} — tạo mới: ${d.new}, tổng: ${d.total}`}</title>
            </rect>
            <text
              x={cx(i)}
              y={yBar(d.new) - 6}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-semibold"
            >
              {d.new}
            </text>
          </g>
        ) : null,
      )}

      {/* Đường: tổng luỹ kế */}
      <polyline
        points={linePoints}
        fill="none"
        className="stroke-emerald-500"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => (
        <circle
          key={`dot-${d.month}`}
          cx={cx(i)}
          cy={yLine(d.total)}
          r={3.5}
          className="fill-emerald-500"
        >
          <title>{`${shortMonth(d.month)} — tổng: ${d.total}`}</title>
        </circle>
      ))}

      {/* Nhãn tháng */}
      {data.map((d, i) => (
        <text
          key={`lbl-${d.month}`}
          x={cx(i)}
          y={H - 12}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          {shortMonth(d.month)}
        </text>
      ))}
    </svg>
  );
}
