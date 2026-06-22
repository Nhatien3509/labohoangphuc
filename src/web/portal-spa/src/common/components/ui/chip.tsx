import TooltipContainer from "@common/components/containers/TooltipContainer";
import TooltipText from "@common/components/containers/TooltipText";

import { X } from "@common/components/icons";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

import { cn } from "@common/lib/core/utils";

const Chip = ({
  label,
  className,
  onClick,
  disableRemove = false,
}: {
  label: string;
  className?: string;
  onClick?: () => void;
  disableRemove?: boolean;
}) => {
  const { t } = useLayoutStore((state) => state);

  return (
    <div
      className={cn(
        "flex w-auto items-center justify-items-center gap-2 rounded bg-neutral-50 py-2 pl-3 pr-2 dark:bg-neutral-dark-50",
        className,
      )}
    >
      <TooltipText content={label} maxWidth={11.5} />
      {!disableRemove && (
        <TooltipContainer content={t("common.actions.delete")}>
          <span>
            <X
              className="shrink-0 cursor-pointer opacity-0 hover:text-primary-200 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15 group-hover:opacity-100"
              size={20}
              onClick={onClick}
            />
          </span>
        </TooltipContainer>
      )}
    </div>
  );
};

export { Chip };
