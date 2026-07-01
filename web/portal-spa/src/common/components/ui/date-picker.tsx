"use client";

import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@common/lib/core/utils";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const PANEL_W = 288;
const PANEL_H = 340;

/** "YYYY-MM-DD" -> Date (bỏ qua chuỗi rỗng / không hợp lệ). */
function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = parseISO(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Ô chọn ngày tuỳ biến (thay input[type=date] mặc định).
 * Lịch được render qua portal + position fixed nên không bị dialog (overflow) cắt.
 */
export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "Chọn ngày",
}: {
  value?: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}) {
  const selected = toDate(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => selected ?? new Date());
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => new Date(), []);

  const updatePos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const top =
      spaceBelow < PANEL_H + 8 && r.top > PANEL_H
        ? r.top - PANEL_H - 4
        : r.bottom + 4;
    let left = r.left;
    if (left + PANEL_W > window.innerWidth - 8) {
      left = window.innerWidth - PANEL_W - 8;
    }
    if (left < 8) left = 8;
    setCoords({ top, left });
  }, []);

  // Mở lịch: nhảy về tháng của ngày đang chọn và tính vị trí.
  function toggle() {
    if (!open) {
      setView(selected ?? new Date());
      updatePos();
    }
    setOpen((v) => !v);
  }

  // Đóng khi bấm ra ngoài / nhấn Esc, và bám theo cuộn/resize.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open, updatePos]);

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(view), { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [view]);

  function pick(d: Date) {
    onChange(format(d, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={toggle}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-left text-sm shadow-sm transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          !selected && "text-muted-foreground",
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate">
          {selected
            ? cap(format(selected, "EEEE, dd/MM/yyyy", { locale: vi }))
            : placeholder}
        </span>
      </button>

      {open && coords
        ? createPortal(
            <div
              ref={panelRef}
              style={{
                position: "fixed",
                top: coords.top,
                left: coords.left,
                width: PANEL_W,
                // Dialog modal của Radix đặt pointer-events:none lên body; panel
                // portal ra body nên phải bật lại để click chọn ngày hoạt động.
                pointerEvents: "auto",
              }}
              // Chặn sự kiện lan ra document để Radix Dialog không hiểu nhầm là
              // "bấm ra ngoài" mà tự đóng khi ta thao tác trên lịch (portal ở body).
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="z-[60] animate-fade-up rounded-lg border border-border bg-background p-3 text-foreground shadow-lg"
            >
              {/* Điều hướng tháng */}
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setView((m) => subMonths(m, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Tháng trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-sm font-semibold">
                  {cap(format(view, "MMMM 'năm' yyyy", { locale: vi }))}
                </div>
                <button
                  type="button"
                  onClick={() => setView((m) => addMonths(m, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Tháng sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Thứ trong tuần */}
              <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="py-1">
                    {w}
                  </div>
                ))}
              </div>

              {/* Lưới ngày */}
              <div className="mt-1 grid grid-cols-7 gap-0.5">
                {days.map((d) => {
                  const isSel = selected && isSameDay(d, selected);
                  const inMonth = isSameMonth(d, view);
                  const isToday = isSameDay(d, today);
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => pick(d)}
                      className={cn(
                        "mx-auto flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
                        isSel
                          ? "bg-brand font-semibold text-brand-foreground"
                          : "hover:bg-accent hover:text-accent-foreground",
                        !isSel && isToday && "border border-brand text-brand",
                        !inMonth && !isSel && "text-muted-foreground/40",
                      )}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Chọn nhanh hôm nay */}
              <div className="mt-2 border-t border-border pt-2 text-center">
                <button
                  type="button"
                  onClick={() => pick(new Date())}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  Hôm nay
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
