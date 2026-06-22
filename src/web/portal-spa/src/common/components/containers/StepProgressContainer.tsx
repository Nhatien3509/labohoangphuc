import { Check } from "@common/components/icons";

import React from "react";
import { cn } from "@common/lib/core/utils";

type StepProps = {
  step: number;
  title: string;
};

type StepProgressContainerProps = {
  steps: StepProps[];
  currentStep: number;
  selected?: Set<number>;
};

export const StepProgressContainer = ({
  steps,
  currentStep,
  selected,
}: StepProgressContainerProps) => (
  <div
    className={`grid w-full grid-cols-${steps.length} justify-around px-[0.0625rem]`}
  >
    {steps.map((val) => (
      <div
        key={crypto.randomUUID()}
        className="col-span-1 flex flex-col items-center justify-center gap-[0.3125rem] py-[0.625rem]"
      >
        <div className={cn("flex w-full items-center justify-center")}>
          <span
            className={cn(
              "h-[0.125rem] w-full flex-1 border border-solid border-primary-100",
              {
                "opacity-10":
                  !selected?.has(val.step) && currentStep !== val.step,
                "opacity-0": val.step === 0,
              },
            )}
          ></span>
          <span
            className={cn(
              "flex size-[2.1875rem] flex-none items-center justify-center rounded-full border-2 border-primary-100 text-md text-primary-100",
              {
                "bg-primary-100 text-neutral-0":
                  currentStep >= val.step || selected?.has(val.step),
              },
            )}
          >
            {selected?.has(val.step) && currentStep !== val.step ? (
              <Check />
            ) : (
              val.step + 1
            )}
          </span>
          <span
            className={cn(
              "h-[0.125rem] w-full flex-1 border border-solid border-primary-100",
              {
                "opacity-10":
                  !selected?.has(val.step) && currentStep !== val.step,
                "opacity-0": val.step === steps.length - 1,
              },
            )}
          ></span>
        </div>
        <div
          className={cn("text-center text-base font-normal leading-6", {
            "text-md font-bold": currentStep === val.step,
          })}
        >
          {val.title}
        </div>
      </div>
    ))}
  </div>
);
