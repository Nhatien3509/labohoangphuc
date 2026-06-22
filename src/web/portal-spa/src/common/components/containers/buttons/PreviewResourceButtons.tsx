import AllowedActionButton from "@common/components/containers/buttons/AllowedActionButton";
import { Button } from "@common/components/ui/button";

import { Back, Close, Eye, Plus } from "@common/components/icons";

import { type CostEstimateCardProps } from "@common/components/cards/CostEstimateCard";
import React from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type PreviewResourceButtonsProps = Omit<
  CostEstimateCardProps,
  | "estimateValue"
  | "multiSectionEstimateData"
  | "chipLabel"
  | "loadingCostEstimate"
> & {
  createResourceTitle?: string;
};

function PreviewResourceButtons({
  isPreview,
  setPreview,
  handlePreview,
  handleCreate,
  loadingResources = false,
  isAllowedAction = true,
  enableBackButton = true,
  handleClose,
  className,
  createResourceTitle,
  ...props
}: Readonly<PreviewResourceButtonsProps>) {
  const { t, hasPaygSubscription } = useLayoutStore((state) => ({
    t: state.t,
    hasPaygSubscription: !!state.currentProject?.hasPaygSubscription,
  }));

  if (hasPaygSubscription) return null;

  return (
    <div {...props} className={cn("flex justify-end gap-3", className)}>
      <Button
        variant={isPreview ? "ghost" : "tertiary"}
        onClick={() => {
          handleClose();
        }}
      >
        <Close size={18} /> {t("common.cost_estimate.cancel")}
      </Button>
      {isPreview && enableBackButton && (
        <Button
          variant={"tertiary"}
          onClick={() => {
            setPreview?.(false);
          }}
        >
          <Back className="text-neutral-700" size={18} />{" "}
          {t("common.cost_estimate.back")}
        </Button>
      )}
      {isPreview ? (
        <AllowedActionButton
          isAllowedAction={isAllowedAction}
          className="bg-primary-100 text-neutral-0"
          isLoading={loadingResources}
          onClick={() => {
            if (!loadingResources) {
              handleCreate().catch(console.error);
            }
          }}
          leftIcon={<Plus />}
        >
          {createResourceTitle ?? t("common.cost_estimate.create")}
        </AllowedActionButton>
      ) : (
        <Button
          className="bg-primary-100 text-neutral-0"
          onClick={() => {
            handlePreview?.().catch(console.error);
          }}
          leftIcon={<Eye />}
        >
          {t("common.cost_estimate.preview")}
        </Button>
      )}
    </div>
  );
}

export default PreviewResourceButtons;
