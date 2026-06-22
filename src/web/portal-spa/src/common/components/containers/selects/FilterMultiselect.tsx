"use client";

import { Checkbox } from "@common/components/ui/checkbox";
import { InnerMenuList } from "@common/components/containers/selects/SelectContainer";
import { type MenuListExtraProps } from "@common/components/ui/select";
import TooltipContainer from "@common/components/containers/TooltipContainer";
import TooltipText from "@common/components/containers/TooltipText";

import { CaretDown, Check, ClearContent } from "@common/components/icons";

import React, {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
  forwardRef,
  useEffect,
  useState,
} from "react";
import ReactSelect, {
  type ActionMeta,
  type ClearIndicatorProps,
  type GroupBase,
  type MenuListProps,
  type OptionProps,
  type ValueContainerProps,
  components,
} from "react-select";
import {
  customFilterOption,
  getBackgroundColor,
} from "@common/lib/helpers/obj";
import type { OptionType } from "@common/lib/core/types";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import useResponsiveWidth from "@common/hooks/useResponsiveWidth";

const randomValue = crypto.randomUUID();

const MenuList: React.FC<MenuListProps & MenuListExtraProps> = (props) => (
  <components.MenuList {...props} className={cn("scrollbar", props.className)}>
    <InnerMenuList {...props} />
  </components.MenuList>
);

const ValueContainer = ({ children, ...props }: ValueContainerProps) => {
  const { t } = useLayoutStore((state) => state);

  // eslint-disable-next-line prefer-const
  let [_values, input] = children as [ReactNode, ReactNode];

  const selected = (props.getValue() as OptionType[]).filter(
    (item) => item.value !== randomValue,
  );

  return (
    <components.ValueContainer
      {...props}
      className="!flex !flex-nowrap gap-2 overflow-auto"
    >
      <div className="shrink-0 text-base">
        {!selected.length || selected.length >= props.options.length - 1
          ? `${t("common.select.all")}(${selected.length})`
          : `${t("common.select.selected")}${selected.length}${t("common.select.out_of")}${props.options.length - 1}`}
      </div>
      {input}
    </components.ValueContainer>
  );
};

export interface FilterMultiselectProps extends ComponentPropsWithoutRef<
  typeof ReactSelect
> {
  onChangeSelectCustom: (newValue: OptionType[]) => void;
  initValue: OptionType[];
  maxLength?: number;
}

const ClearIndicator = (
  propsIn: ClearIndicatorProps,
  t: (key: string) => string,
) => {
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

const FilterMultiselect = forwardRef<
  ElementRef<typeof ReactSelect>,
  FilterMultiselectProps
>(({ id, onChangeSelectCustom, initValue, maxLength = 255, ...props }, ref) => {
  const { t } = useLayoutStore((state) => state);
  const { elementRef: selectWrapperRef, width = 20 } = useResponsiveWidth();
  const inputPaddingAndRightIconByRem = 60;

  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState<OptionType[]>(initValue);

  useEffect(() => {
    if (initValue == selected) {
      return;
    }

    setSelected(initValue);
  }, [initValue]);

  const isAllSelected = selected.length === props.options?.length;

  const selectAllLabel = `${t("common.select.select_all")}(${t("common.select.selected")} ${selected.filter((item) => item.value !== randomValue).length}${t("common.select.out_of")}${props.options?.length})`;

  const allOption = { value: "*", label: selectAllLabel };

  const Option = (optionProps: OptionProps) => {
    const data = optionProps.data as OptionType;
    const isChecked = () => {
      if (isAllSelected) {
        return true;
      }
      return selected.length ? "indeterminate" : false;
    };

    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );

    const widthOption = () => {
      const paddingYAndLeftIconByRem = 4.5;

      return Number(
        (width / rootFontSize - paddingYAndLeftIconByRem).toFixed(),
      );
    };

    return (
      <components.Option
        {...optionProps}
        className={` ${data.value === "*" ? "border-b" : ""}`}
      >
        <div className="flex cursor-pointer">
          {data.value === "*" && (
            <Checkbox
              className="mr-2"
              tabIndex={-1}
              key={data.value}
              checked={isChecked()}
            />
          )}
          <div className={cn({ "pl-3": data.value !== "*" })}>
            <TooltipText content={optionProps.label} maxWidth={widthOption()} />
          </div>
          {data.value !== "*" && (optionProps.isSelected || isAllSelected) && (
            <Check size={24} className="ml-auto shrink-0 text-primary-100" />
          )}
        </div>
      </components.Option>
    );
  };

  const optionsProp = props.options?.length
    ? [...(props.options as OptionType[])]
    : [];

  const sortedOptions = [...optionsProp].sort((a, b) => {
    if (selected.some((val) => val.value === a.value)) return -1;
    if (selected.some((val) => val.value === b.value)) return 1;
    return 0;
  });

  const options = props.options?.length ? [allOption, ...sortedOptions] : [];

  return (
    <div ref={selectWrapperRef}>
      <ReactSelect
        {...props}
        ref={ref}
        isMulti
        isSearchable
        className={cn("group text-base dark:bg-neutral-200", props.className)}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        inputId={id}
        instanceId={`${id}-instance`}
        {...(inputValue && {
          isClearable: true,
        })}
        options={options}
        value={selected}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator: () => (
            <CaretDown className="dark:text-neutral-900" />
          ),
          ClearIndicator: (propsIn) => ClearIndicator(propsIn, t),
          ValueContainer,
          Option,
          ...props.components,
          MenuList: MenuList as React.ComponentType<
            MenuListProps<unknown, boolean, GroupBase<unknown>>
          >,
          Placeholder: () => null,
        }}
        styles={{
          menu: (provided) => ({
            ...provided,
            zIndex: 48,
            boxShadow: "var(--D-X0-Y0-B10-S0-30)",
            paddingTop: "0.25rem",
            paddingBottom: "0.25rem",
            borderRadius: "0.5rem",
          }),
          control: (base, props) => ({
            ...base,
            cursor: "pointer",
            gap: "0.5rem",
            padding: "0 0.75rem",
            minHeight: "2.25rem",
            boxShadow: "none",
            borderColor: props.menuIsOpen
              ? "var(--neutral-500)"
              : "var(--neutral-200)",
            ":hover": {
              borderColor: "var(--neutral-500)",
            },
            ":focus": {
              borderColor: "var(--neutral-500)",
            },
            ":target": {
              borderColor: "var(--neutral-500)",
            },
          }),
          valueContainer: (base) => ({
            ...base,
            padding: 0,
          }),
          input: (base) => ({
            ...base,
            ...(width && { maxWidth: width - inputPaddingAndRightIconByRem }),
            margin: 0,
            padding: 0,
          }),
          placeholder: (base) => ({
            ...base,
            margin: 0,
          }),
          option: (base, props) => ({
            ...base,
            fontSize: "var(--font-size)",
            lineHeight: "var(--line-height)",
            color: "var(--neutral-800)",
            backgroundColor: getBackgroundColor(base, props),
            fontWeight: props.isSelected ? "600" : "400",
            transition: "ease-out",
            transitionDelay: "0.5",
            ":active": {
              backgroundColor: "var(--primary-50)",
              fontWeight: props.isSelected ? 600 : 500,
            },
            ":hover": {
              backgroundColor: "var(--primary-50)",
              fontWeight: props.isSelected ? 600 : 500,
            },
          }),
          noOptionsMessage: (base) => ({
            ...base,
            fontSize: "var(--font-size)",
            fontStyle: "italic",
            color: "var(--neutral-800)",
          }),
          ...props.styles,
        }}
        inputValue={inputValue}
        onInputChange={(newValue) => {
          if (newValue.length > maxLength) return;
          setInputValue(newValue);
          if (newValue && !selected.length) {
            setSelected([{ value: randomValue, label: randomValue }]);
          }
          if (!newValue && selected[0]?.value === randomValue) {
            setSelected([]);
          }
        }}
        onChange={(newValue, actionMeta: ActionMeta<unknown>) => {
          if (actionMeta.action === "clear" && inputValue.length) {
            setInputValue("");
            return;
          }

          const selectedNew = (newValue as OptionType[]).filter(
            (item) => item.value !== randomValue,
          );

          const isSelectAll =
            selectedNew.find((option) => option.value === "*") ??
            selectedNew.length >= options.length - 1;

          const selectedAllData =
            selectedNew.length === options.length ? [] : options.slice(1);

          const selectedData = isSelectAll ? selectedAllData : selectedNew;

          setSelected(selectedData);
          onChangeSelectCustom(selectedData);
        }}
        noOptionsMessage={() => t("common.select.no_options")}
        openMenuOnFocus
        tabSelectsValue={false}
        backspaceRemovesValue={false}
        filterOption={customFilterOption}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === " " && !inputValue) e.preventDefault();
        }}
      />
    </div>
  );
});

FilterMultiselect.displayName = "FilterMultiselect";

export default FilterMultiselect;
