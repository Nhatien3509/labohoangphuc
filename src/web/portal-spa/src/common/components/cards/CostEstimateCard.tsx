"use client";

import { Card, CardContent } from "@common/components/ui/card";
import AllowedActionButton from "@common/components/containers/buttons/AllowedActionButton";
import { Button } from "@common/components/ui/button";
import { Chip } from "@common/components/ui/chip";
import { Skeleton } from "@common/components/ui/skeleton";

import { Back, Close, Eye, Plus, Send } from "@common/components/icons";
import AskQuestionsDialog from "@common/components/dialogs/AskQuestionsDialog";

import type { CostEstimate, EstimateItem } from "@/api/common/types";
import { type ReactNode, useState } from "react";
import { cn } from "@common/lib/core/utils";
import { formatCurrency } from "@common/lib/helpers/numbers";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export type CostEstimateCardProps = React.ComponentProps<"div"> & {
  estimateValue?: CostEstimate;
  multiSectionEstimateData?: MultiSectionEstimateData;
  chipLabel?: string;
  setPreview?: (value: boolean) => void;
  isPreview: boolean;
  handleCreate: () => Promise<void>;
  handlePreview?: () => Promise<void>;
  loadingCostEstimate?: boolean;
  loadingResources?: boolean;
  isAllowedAction?: boolean;
  enableBackButton?: boolean;
  handleClose: () => void;
  className?: string;
  confirmText?: string;
  confirmIcon?: ReactNode;
};
type EstimateSectionType = {
  label?: string;
  components: EstimateItem[];
};
export type MultiSectionEstimateData = {
  estimateSections: EstimateSectionType[];
  hourlyPrice: string;
  monthlyPrice: string;
  reserveAmount: string;
};

type CurrencyTextProps = { str: string; unit?: string };

const CurrencyText = ({ str, unit }: CurrencyTextProps) => {
  return (
    <span>
      {formatCurrency(Number(str), {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        locale: "vi-VN",
        currency: "VND",
        isShowCurrency: true,
      })}
      {unit && `/${unit}`}
    </span>
  );
};

function CostEstimateCard({
  estimateValue,
  multiSectionEstimateData,
  chipLabel,
  isPreview,
  setPreview,
  handlePreview,
  handleCreate,
  loadingCostEstimate = false,
  loadingResources = false,
  isAllowedAction = true,
  enableBackButton = true,
  handleClose,
  className,
  confirmText,
  confirmIcon = <Plus />,
  ...props
}: Readonly<CostEstimateCardProps>) {
  const { t, hasPaygSubscription } = useLayoutStore((state) => ({
    t: state.t,
    hasPaygSubscription: !!state.currentProject?.hasPaygSubscription,
  }));
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!hasPaygSubscription) return null;

  return (
    <div>
      <Card
        {...props}
        className={cn(
          "sticky top-[5.625rem] w-[23.625rem] shadow-D-X0-Y2-B4-S0-15 dark:shadow-D-X0-Y2-B4-S0-25",
          className,
        )}
      >
        <div className="flex items-center justify-center gap-3 rounded-t-lg bg-neutral-800 p-2">
          <h3 className="text-xl font-semibold leading-8 text-neutral-0">
            {t("common.cost_estimate.title")}
          </h3>
        </div>

        <CardContent>
          <div className="flex flex-col gap-3">
            {loadingCostEstimate ? (
              <div className="flex flex-col gap-2">
                <div>
                  <div className="mb-1 flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ) : (
              <>
                {estimateValue?.components && (
                  <EstimateSection
                    item={{ components: estimateValue.components }}
                    chipLabel={chipLabel}
                  />
                )}
                {multiSectionEstimateData && (
                  <MultiEstimateSection
                    multiSectionEstimateData={multiSectionEstimateData}
                    chipLabel={chipLabel}
                  />
                )}
              </>
            )}

            <div className="border-b border-neutral-100"></div>
            <div>
              <div className="mb-3 flex justify-between">
                <p className="text-md font-bold">
                  {t("common.cost_estimate.hourly_estimate")}
                </p>
                {loadingCostEstimate ? (
                  <div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <p className="text-md font-bold text-primary-100">
                    <CurrencyText
                      str={
                        estimateValue?.hourlyPrice ??
                        multiSectionEstimateData?.hourlyPrice ??
                        ""
                      }
                    />
                  </p>
                )}
              </div>

              <div className="mb-2 flex justify-between">
                <p className="text-base">
                  {t("common.cost_estimate.monthly_estimate")}
                </p>
                {loadingCostEstimate ? (
                  <div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <p className="text-base">
                    <CurrencyText
                      str={
                        estimateValue?.monthlyPrice ??
                        multiSectionEstimateData?.monthlyPrice ??
                        ""
                      }
                    />
                  </p>
                )}
              </div>

              <div className="mb-3 flex justify-between">
                <p className="w-3/4 text-base">
                  {t("common.cost_estimate.reserve_amount")}
                </p>
                {loadingCostEstimate ? (
                  <div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <p className="text-base">
                    <CurrencyText
                      str={
                        estimateValue?.reserveAmount ??
                        multiSectionEstimateData?.reserveAmount ??
                        ""
                      }
                    />
                  </p>
                )}
              </div>

              <ul className="ml-2 list-inside list-disc text-base font-normal text-neutral-400">
                <li>
                  <span className="-ml-2 firefox:ml-0">
                    {t("common.cost_estimate.hours_each_month")}
                  </span>
                </li>
                <li>
                  <span className="-ml-2 firefox:ml-0">
                    {t("common.cost_estimate.tax")}
                  </span>
                </li>
                <li>
                  <span className="-ml-2 firefox:ml-0">
                    {t("common.cost_estimate.rounded")}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <div>
                {isPreview ? (
                  <AllowedActionButton
                    isAllowedAction={isAllowedAction}
                    className="w-full bg-primary-100 text-neutral-0"
                    isLoading={loadingResources}
                    onClick={() => {
                      if (!loadingResources) {
                        handleCreate().catch(console.error);
                      }
                    }}
                    leftIcon={confirmIcon}
                    disabled={!enableBackButton && loadingCostEstimate}
                  >
                    {confirmText ?? t("common.cost_estimate.create")}
                  </AllowedActionButton>
                ) : (
                  <Button
                    className="w-full bg-primary-100 text-neutral-0"
                    onClick={() => {
                      if (!loadingCostEstimate) {
                        handlePreview?.().catch(console.error);
                      }
                    }}
                    isLoading={loadingCostEstimate}
                    leftIcon={<Eye />}
                  >
                    {t("common.cost_estimate.preview")}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  className="w-1/2"
                  variant={"tertiary"}
                  onClick={() => {
                    handleClose();
                  }}
                >
                  <Close size={18} /> {t("common.cost_estimate.cancel")}
                </Button>
                {isPreview && enableBackButton ? (
                  <Button
                    className="w-1/2"
                    variant={"tertiary"}
                    onClick={() => {
                      setPreview?.(false);
                    }}
                  >
                    <Back className="text-neutral-700" size={18} />{" "}
                    {t("common.cost_estimate.back")}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setIsOpen(true);
                    }}
                    className="w-1/2"
                    variant={"tertiary"}
                  >
                    <Send size={18} /> {t("common.cost_estimate.ask_questions")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <AskQuestionsDialog {...{ isOpen, setIsOpen }} />
    </div>
  );
}

export default CostEstimateCard;

const EstimateSection = ({
  item: { label, components },
  index,
  chipLabel,
}: {
  item: EstimateSectionType;
  index?: string;
  chipLabel?: string;
}) => {
  const t = useLayoutStore((state) => state.t);

  return (
    <div className="flex flex-col gap-3">
      {label && index && (
        <div className="text-md font-semibold leading-5">
          {index}. {label}
        </div>
      )}
      {components.map((item, index) => (
        <div key={`${item.label}-${index}`}>
          <div className="mb-1 flex justify-between">
            <div className="flex gap-2 text-base">
              <p>{item.label} </p>
              {chipLabel &&
                (item.label.toLowerCase().includes("ram") ||
                  item.label.toLowerCase().includes("cpu")) && (
                  <Chip
                    disableRemove
                    className="rounded-sm bg-neutral-700 p-[0_0.3125rem] capitalize text-neutral-0"
                    label={chipLabel}
                  />
                )}
            </div>

            <p className="text-base">
              <CurrencyText
                str={item.originalPrice}
                unit={t("common.cost_estimate.per_hour")}
              />
            </p>
          </div>

          <div className="text-base font-semibold">
            {item.quantity && `${formatCurrency(Number(item.quantity))} `}
            {item.unit}
          </div>
        </div>
      ))}
    </div>
  );
};

const MultiEstimateSection = ({
  multiSectionEstimateData,
  chipLabel,
}: {
  multiSectionEstimateData?: MultiSectionEstimateData;
  chipLabel?: string;
}) => (
  <div className="space-y-[1.125rem]">
    {multiSectionEstimateData?.estimateSections.map((item, index) => (
      <EstimateSection
        key={`${item.label}-${index}`}
        item={item}
        index={`${index + 1}`}
        chipLabel={chipLabel}
      />
    ))}
  </div>
);
