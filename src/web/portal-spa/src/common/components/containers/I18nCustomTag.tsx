import { cn } from "@common/lib/core/utils";

const I18nCustomTag =
  ({ className }: { className?: string } = {}) =>
  (chunk: React.ReactNode) => (
    <span className={cn("break-words font-semibold", className)}>{chunk}</span>
  );

export default I18nCustomTag;
