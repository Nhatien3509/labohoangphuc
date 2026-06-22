"use client";

import { Button } from "@common/components/ui/button";
import Select from "@common/components/ui/select";
import TooltipContainer from "@common/components/containers/TooltipContainer";
import TooltipText from "@common/components/containers/TooltipText";
import { withExtraProps } from "@common/components/containers/Hoc";

import {
  CaretDown,
  Check,
  ClearContent,
  Close,
  Loading,
  Plus,
} from "@common/components/icons";

import ReactSelect, {
  type CSSObjectWithLabel,
  type ClearIndicatorProps,
  type DropdownIndicatorProps,
  type GroupBase,
  type MenuListProps,
  type MultiValueProps,
  type MultiValueRemoveProps,
  type OptionProps,
  components,
} from "react-select";
import type { OptionType } from "@common/lib/core/types";
import React from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import useResponsiveWidth from "@common/hooks/useResponsiveWidth";

type SelectProps = React.ComponentProps<typeof Select>;
export type CurrentValue<Option, IsMulti extends boolean> = IsMulti extends true
  ? readonly Option[] | null
  : Option | null;

const SelectContainer = React.forwardRef<
  React.ElementRef<typeof Select>,
  SelectProps
>(({ isAllowedAccess = true, ...props }, ref) => {
  const { t } = useLayoutStore((state) => state);
  const { elementRef, width = 20 } = useResponsiveWidth();
  const isOverflowY =
    (elementRef.current?.getBoundingClientRect().height ?? 0) > 36; // 36px is the base height of the component
  const baseAllowedAccessComponent = getBaseAllowedAccessComponent<
    OptionType,
    false
  >({
    width,
    createLabel: props.createLabel,
    isCreatable: props.isCreatable,
    onCreate: props.onCreate,
    currentValue: props.value as CurrentValue<OptionType, false>,
  });

  if (isAllowedAccess)
    return (
      <div ref={elementRef}>
        <Select
          ref={ref}
          width={width}
          isOverflowY={isOverflowY}
          {...props}
          components={{
            ...baseAllowedAccessComponent,
            ...props.components,
          }}
        />
      </div>
    );

  return (
    <TooltipContainer content={t("common.allowed_actions.no_access")}>
      <div ref={elementRef}>
        <ReactSelect
          {...props}
          isDisabled
          className={cn(
            "group w-full text-base dark:bg-neutral-200",
            props.className,
          )}
          ref={ref}
          inputId={props.id}
          instanceId={`${props.id}-instance`}
          placeholder={props.placeholder ?? ""}
          components={{
            ...baseNotAllowedAccessComponent,
            ...props.components,
          }}
          styles={disabledStyles}
        />
      </div>
    </TooltipContainer>
  );
});

SelectContainer.displayName = "SelectContainer";

export default SelectContainer;
interface CustomOptionExtra<Option extends OptionType, IsMulti extends false> {
  width: number;
  focusedOptionIndex: number;
  currentValue?: CurrentValue<Option, IsMulti>;
}

type CustomOptionProps<
  Option extends OptionType,
  IsMulti extends false,
  Group extends GroupBase<Option>,
> = OptionProps<Option, IsMulti, Group> & CustomOptionExtra<Option, IsMulti>;

type MenuListExtraProps = {
  createLabel?: React.ReactNode;
  onCreate?: () => void;
  isCreatable?: boolean;
};
export const MultiValueRemove = (props: MultiValueRemoveProps) => {
  return (
    <components.MultiValueRemove {...props}>
      <Close size={16} />
    </components.MultiValueRemove>
  );
};

export const DropdownIndicator = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  props: DropdownIndicatorProps<Option, IsMulti, Group>,
) => {
  const { isDisabled } = props;

  return isDisabled ? null : (
    <CaretDown className={cn("text-neutral-700 dark:text-neutral-900")} />
  );
};

export const ClearIndicator = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  propsIn: ClearIndicatorProps<Option, IsMulti, Group>,
) => {
  const t = useLayoutStore((state) => state.t);
  const {
    innerProps: { ref, ...restInnerProps },
  } = propsIn;

  return (
    <div
      className={cn("opacity-0 group-hover:opacity-100", {
        "opacity-100": propsIn.isFocused,
      })}
      ref={ref}
      {...restInnerProps}
    >
      <TooltipContainer
        isPreventDefault={false}
        content={t("common.actions.delete")}
        disableHoverableContent={true}
      >
        <span>
          <ClearContent />
        </span>
      </TooltipContainer>
    </div>
  );
};

export const Option = <
  Option extends OptionType,
  IsMulti extends false,
  Group extends GroupBase<Option>,
>({
  width,
  focusedOptionIndex,
  children,
  currentValue,
  ...optionProps
}: CustomOptionProps<Option, IsMulti, Group>) => {
  const { t } = useLayoutStore((state) => state);

  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );

  const optionWidth = () => {
    if (optionProps.isSelected) {
      const paddingAndRightIconByRem = 4.5;

      return Number(
        (width / rootFontSize - paddingAndRightIconByRem).toFixed(),
      );
    }

    const paddingByRem = 2.5;

    return Number((width / rootFontSize - paddingByRem).toFixed());
  };

  return optionProps.isDisabled ? (
    <div className="flex items-center justify-between bg-neutral-100 px-4 py-2 text-base text-neutral-500">
      <div className="ml-2 w-full">
        {
          <TooltipText
            alwaysDisplayTooltip
            content={optionProps.label}
            tooltipContent={
              !(optionProps.data as { disableTooltip?: boolean }).disableTooltip
                ? ((optionProps.data as { tooltipContent?: string })
                    .tooltipContent ?? t("common.allowed_actions.no_access"))
                : ""
            }
            maxWidth={optionWidth()}
          />
        }
      </div>
    </div>
  ) : (
    <components.Option {...optionProps}>
      <div className="flex cursor-pointer items-center justify-between">
        <div className="ml-2">
          <TooltipText content={optionProps.label} maxWidth={optionWidth()} />
        </div>
        {(optionProps.isSelected ||
          optionProps.data.value === currentValue?.value) && (
          <Check className="ml-2 shrink-0 text-primary-100" />
        )}
      </div>
    </components.Option>
  );
};

export const InnerMenuList = ({
  children,
  createLabel,
  isCreatable,
  onCreate,
  isLoadingMore,
}: MenuListExtraProps & {
  children?: React.ReactNode;
  isLoadingMore?: boolean;
}) => {
  const t = useLayoutStore((state) => state.t);

  return (
    <>
      {children}
      {isLoadingMore && (
        <div className="sticky bottom-0 flex items-center justify-center gap-1 bg-neutral-0 px-4 py-2 text-base text-neutral-800">
          <Loading className="animate-spin" />
          {t("common.loading_more")}
        </div>
      )}
      {createLabel &&
        (!isCreatable ? (
          <NotAllowCreate label={createLabel} />
        ) : (
          <Button
            className="sticky bottom-0 flex h-12 w-full cursor-pointer justify-start gap-2 rounded-none rounded-b-sm border-t border-t-neutral-100 bg-neutral-50 px-4 py-4 text-neutral-800 hover:bg-neutral-100 active:bg-neutral-100 active:shadow-I-X0-Y0-B6-S0-30"
            onClick={onCreate}
          >
            <Plus size={20} />
            {createLabel}
          </Button>
        ))}
    </>
  );
};

export const MenuList: React.FC<MenuListProps & MenuListExtraProps> = ({
  createLabel,
  onCreate,
  isCreatable,
  children,
  ...props
}) => {
  const selectProps = props.selectProps;

  const hasOptions = Array.isArray(props.options) && props.options.length > 0;

  const isLoadingMore = hasOptions && selectProps.isLoading;

  return (
    <components.MenuList
      {...props}
      className={cn("scrollbar", props.className, {
        "!pb-0": !!createLabel || isLoadingMore,
      })}
    >
      <InnerMenuList
        {...{ children, createLabel, isCreatable, onCreate, isLoadingMore }}
      />
    </components.MenuList>
  );
};

export const MenuListWrapper = ({ children, ...props }: MenuListProps) => {
  return (
    <button
      className="w-full"
      onMouseLeave={() => {
        const currentValue = (props.selectProps.value as OptionType | null)
          ?.value;
        if (!currentValue) return;
      }}
    >
      <components.MenuList
        {...props}
        className={cn("scrollbar", props.className)}
      >
        {children}
      </components.MenuList>
    </button>
  );
};

export const NotAllowCreate = ({ label = "" }: { label?: React.ReactNode }) => {
  const { t } = useLayoutStore((state) => state);
  return (
    <TooltipContainer content={t("common.allowed_actions.no_perform")}>
      <div className="sticky bottom-0 flex h-12 w-full items-center justify-start gap-2 rounded-b-sm border-t border-t-neutral-100 bg-neutral-100 px-4 py-2 text-base font-medium text-neutral-200">
        <Plus size={20} />
        {label}
      </div>
    </TooltipContainer>
  );
};

export const MultiValueContainer = ({
  width,
  ...props
}: MultiValueProps<OptionType, true> & { width: number }) => {
  const totalOtherSpacing = 6.25;

  return (
    <components.MultiValue {...props}>
      <TooltipText
        content={props.data.label}
        maxWidth={width / 16 - totalOtherSpacing}
      />
    </components.MultiValue>
  );
};

interface BaseAllowedAccessParams<
  Option extends OptionType,
  IsMulti extends boolean,
> {
  width?: number;
  createLabel?: React.ReactNode;
  isCreatable?: boolean;
  onCreate?: () => void;
  currentValue?: CurrentValue<Option, IsMulti>;
}

export const baseNotAllowedAccessComponent = {
  IndicatorSeparator: () => null,
  DropdownIndicator,
  ClearIndicator,
};

export const getBaseAllowedAccessComponent = <
  Option extends OptionType,
  IsMulti extends false,
>({
  width,
  createLabel,
  isCreatable,
  onCreate,
  currentValue,
}: BaseAllowedAccessParams<Option, IsMulti>) => ({
  ...baseNotAllowedAccessComponent,
  MultiValueRemove,
  Option: withExtraProps(Option, {
    currentValue,
    width,
  }),
  MenuList: withExtraProps(MenuList, {
    createLabel,
    isCreatable,
    onCreate,
  }),
  MultiValue: withExtraProps(MultiValueContainer, {
    width,
  }),
});

export const disabledStyles = {
  control: (base: CSSObjectWithLabel) => ({
    ...base,
    backgroundColor: "var(--neutral-100)",
    border: "none",
    gap: "0.5rem",
    padding: "0 0.75rem",
    minHeight: "2.25rem",
  }),
  placeholder: (base: CSSObjectWithLabel) => ({
    ...base,
    margin: 0,
    color: "var(--neutral-200)",
  }),
};
