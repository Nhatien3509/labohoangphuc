"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState } from "react";

import { cn } from "@common/lib/core/utils";

/**
 * Ô nhập mã thẻ — đẩy mã lên URL (/tra-cuu?code=...), Server Component lo việc fetch.
 * `variant="compact"` dùng cho ô tra cứu nhanh ở trang chủ.
 */
export function LookupForm({
  initialCode = "",
  variant = "page",
  autoFocus = false,
}: {
  initialCode?: string;
  variant?: "page" | "compact";
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    router.push(
      trimmed ? `/tra-cuu?code=${encodeURIComponent(trimmed)}` : "/tra-cuu",
    );
  }

  const compact = variant === "compact";

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex w-full items-center gap-2 rounded-2xl border border-border bg-background shadow-sm",
        compact ? "p-1.5" : "p-2",
      )}
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={
          compact
            ? "Nhập mã bảo hành..."
            : "Nhập mã thẻ bảo hành, vd: LHP-2026-000123"
        }
        autoFocus={autoFocus}
        className={cn(
          "min-w-0 flex-1 bg-transparent px-4 text-foreground outline-none placeholder:text-muted-foreground",
          compact ? "py-2.5 text-sm" : "py-3.5 text-[15px]",
        )}
      />
      <button
        type="submit"
        className={cn(
          "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-brand font-semibold text-brand-foreground transition-colors hover:bg-brand-dark",
          compact ? "px-4 py-2.5 text-sm" : "px-6 py-3.5 text-[15px]",
        )}
      >
        <Search className={compact ? "h-4 w-4" : "h-[18px] w-[18px]"} />
        Tra cứu
      </button>
    </form>
  );
}
