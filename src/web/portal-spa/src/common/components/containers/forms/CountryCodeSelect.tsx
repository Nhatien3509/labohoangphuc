import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@common/components/ui/form";
import { type SelectProps } from "@common/components/ui/select";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import * as Flags from "country-flag-icons/react/3x2";
import { CaretDown, ClearContent } from "@common/components/icons";

import React, { useMemo } from "react";
import ReactSelect, {
  type ClearIndicatorProps,
  type DropdownIndicatorProps,
  type FilterOptionOption,
  type GroupBase,
  type MenuListProps,
  type OptionProps,
  type SingleValueProps,
  type StylesConfig,
  components,
} from "react-select";
import { TELEPHONE_COUNTRY_CODES } from "@common/lib/core/const";
import { cn } from "@common/lib/core/utils";
import { handleFocusRelatedTarget } from "@common/components/containers/forms/InputForm";
import { removeVietnameseTones } from "@common/lib/helpers/str";
import { useFormContext } from "react-hook-form";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export type CountryCodeOption = {
  value: string;
  label: string;
  code: string;
};

interface CountryCodeSelectFormProps extends SelectProps {
  name: string;
}

const CustomOption: React.FC<
  OptionProps<CountryCodeOption, false, GroupBase<CountryCodeOption>>
> = (props) => {
  const { data, innerRef, innerProps } = props;
  const countryCode = data.code.toUpperCase();

  const FlagIcon =
    countryCode in Flags ? Flags[countryCode as keyof typeof Flags] : Flags.US;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={cn(
        "flex h-9 cursor-pointer items-center gap-2 pb-3 pl-4 pt-3",
        {
          "bg-primary-50 text-gray-500": props.isFocused,
        },
      )}
    >
      <FlagIcon title={data.label} className="size-5" />
      {`${data.label} (+${data.value})`}
    </div>
  );
};

const SingleValue: React.FC<SingleValueProps> = (props) => {
  const { data, options, getValue } =
    props as SingleValueProps<CountryCodeOption>;
  const isMissingCode = !("code" in data);

  const fullData: CountryCodeOption = useMemo(() => {
    if (!isMissingCode) return data;

    return (
      options.find(
        (item): item is CountryCodeOption =>
          "value" in item && item.label === getValue()[0]?.label,
      ) ?? data
    );
  }, [data, options, isMissingCode]);
  const countryCode = fullData.code.toUpperCase();
  const FlagIcon =
    countryCode in Flags ? Flags[countryCode as keyof typeof Flags] : Flags.US;

  return (
    <components.SingleValue {...props} className="flex">
      <div>
        <FlagIcon title={fullData.label} className="size-5" />
      </div>
      <div className="pl-2"> {`+${fullData.value}`}</div>
    </components.SingleValue>
  );
};

const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return props.selectProps.inputValue ? null : (
    <CaretDown className="dark:text-neutral-900" />
  );
};

const MenuList = (props: MenuListProps) => {
  return (
    <components.MenuList
      {...props}
      className={cn(
        props.className,
        "scrollbar cursor-pointer text-base",
        "!w-[27.75rem] !p-0",
      )}
    />
  );
};

const ClearIndicator = (props: ClearIndicatorProps) => {
  const { t } = useLayoutStore((state) => state);

  return props.selectProps.inputValue ? (
    <TooltipContainer content={t("common.actions.delete")}>
      <button onClick={props.clearValue}>
        <ClearContent size={20} />
      </button>
    </TooltipContainer>
  ) : null;
};

const customFilter = (
  option: FilterOptionOption<unknown>,
  inputValue: string,
) => {
  const formatString = option.label + " +" + option.value;
  const normalizedString =
    removeVietnameseTones(formatString).toLocaleLowerCase();

  return normalizedString.includes(
    removeVietnameseTones(inputValue).toLowerCase(),
  );
};

const CountryCodeSelect = ({ name, ...props }: CountryCodeSelectFormProps) => {
  const { t } = useLayoutStore((state) => state);

  const options: CountryCodeOption[] = useMemo(
    () =>
      TELEPHONE_COUNTRY_CODES.map((item) => ({
        value: String(item.phone),
        label: t(`countries.${item.code}`),
        code: item.code,
      })),
    [t],
  );

  const {
    formState: { errors },
    control,
  } = useFormContext();

  const hasError = !!errors[name];

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1">
          <FormControl>
            <ReactSelect
              openMenuOnFocus
              menuPortalTarget={
                typeof window !== "undefined" ? document.body : null
              }
              options={options}
              isClearable
              isSearchable
              {...props}
              {...field}
              value={(field.value as unknown) ?? null}
              onChange={(e) => {
                field.onChange(e);
              }}
              placeholder={t("common.select.placeholder")}
              styles={getCustomSelectStyles(hasError)}
              filterOption={customFilter}
              components={{
                Option: CustomOption as unknown as React.ComponentType<
                  OptionProps<unknown, boolean, GroupBase<unknown>>
                >,
                SingleValue,
                IndicatorSeparator: () => null,
                DropdownIndicator,
                MenuList,
                ClearIndicator,
              }}
              onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                if (props.onBlur) props.onBlur(event);
                handleFocusRelatedTarget(event);
              }}
              backspaceRemovesValue={false}
              tabSelectsValue={false}
              noOptionsMessage={() => t("common.select.no_options")}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const getCustomSelectStyles = (
  hasError: boolean,
): StylesConfig<unknown, false, GroupBase<unknown>> => ({
  control: (base, props) => ({
    ...base,
    width: hasError ? "9.6875rem" : "7rem",
    maxWidth: hasError ? "9.6875rem" : "7rem",
    caretColor: "transparent",
    border: props.isDisabled ? "none" : "",
    backgroundColor: props.isDisabled ? "var(--neutral-100)" : "",
    boxShadow: props.menuIsOpen ? "var(--D-X0-Y0-B6-S0-30)" : "none",
    gap: "0",
    padding: "0 0.5rem",
    height: "2rem !important",
    borderColor: hasError ? "red" : "var(--neutral-200)",
    minHeight: "2rem",
    ":hover": {
      boxShadow: "var(--D-X0-Y0-B6-S0-30)",
      borderColor: props.menuIsOpen
        ? "var(--neutral-500)"
        : "var(--neutral-400)",
    },
    ":focus": {
      borderColor: props.menuIsOpen
        ? "var(--neutral-500)"
        : "var(--neutral-400)",
      boxShadow: "var(--D-X0-Y0-B6-S0-30)",
    },
    ":target": {
      borderColor: props.menuIsOpen
        ? "var(--neutral-500)"
        : "var(--neutral-400)",
      boxShadow: "var(--D-X0-Y0-B6-S0-30)",
    },
    ":active": {
      boxShadow: "var(--D-X0-Y0-B6-S0-30)",
      borderColor: props.menuIsOpen
        ? "var(--neutral-500)"
        : "var(--neutral-400)",
    },
    ":focus-visible": {
      borderColor: props.menuIsOpen ? "red" : "var(--neutral-400)",
      boxShadow: "var(--D-X0-Y0-B6-S0-30)",
    },
  }),
  valueContainer: (base) => ({ ...base, padding: "0" }),
  placeholder: (base) => ({
    ...base,
    color: "var(--neutral-400)",
    padding: "0",
  }),
  menu: (provided) => ({
    ...provided,
    padding: "0.5rem 0",
    borderRadius: "0.25rem",
    width: "27.75rem",
  }),
  option: (provided) => ({
    ...provided,
    maxWidth: "100%",
    zIndex: 9999,
    width: "100%",
  }),
  noOptionsMessage: (base) => ({
    ...base,
    fontSize: "var(--font-size)",
    fontStyle: "italic",
    color: "var(--neutral-800)",
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
    pointerEvents: "all",
  }),
});

export default CountryCodeSelect;
