"use client";

import type {
  ActionMeta,
  GroupBase,
  OnChangeValue,
  Props as SelectPropsBase,
} from "react-select";
import type { ExtraSelectProps } from "@common/components/ui/select";
import { cn } from "@common/lib/core/utils";
import { createSelectStyles } from "@common/lib/core/select";
import { customFilterOption } from "@common/lib/helpers/obj";
import { handleFocusRelatedTarget } from "@common/components/containers/forms/InputForm";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useState } from "react";

export interface CommonSelectHookParams<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> {
  id?: string;
  readOnly?: boolean;
  props: SelectPropsBase<Option, IsMulti, Group> & ExtraSelectProps;
}

type CommonProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> = Pick<
  SelectPropsBase<Option, IsMulti, Group>,
  | "className"
  | "isDisabled"
  | "inputId"
  | "instanceId"
  | "menuPlacement"
  | "menuPortalTarget"
  | "menuPosition"
  | "components"
  | "inputValue"
  | "onInputChange"
  | "onChange"
  | "onKeyDown"
  | "onBlur"
  | "noOptionsMessage"
  | "placeholder"
  | "tabSelectsValue"
  | "backspaceRemovesValue"
  | "filterOption"
  | "styles"
>;

export function useSelectCommonProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  params: CommonSelectHookParams<Option, IsMulti, Group>,
): {
  inputValue: string;
  commonProps: CommonProps<Option, IsMulti, Group>;
} {
  const { id, readOnly, props } = params;
  const { maxLength = 100, dependentFieldLabel, onChange, onBlur } = props;
  const t = useLayoutStore((s) => s.t);
  const [inputValue, setInputValue] = useState("");

  const readonlyBackGroundColor = readOnly
    ? "var(--neutral-100)"
    : "var(--neutral-0)";

  const handleInputChange = (value: string) => {
    const truncatedValue =
      value.length > maxLength ? value.slice(0, maxLength) : value;
    setInputValue(truncatedValue);
  };

  const handleChange = (
    newValue: OnChangeValue<Option, IsMulti>,
    actionMeta: ActionMeta<Option>,
  ) => {
    if (actionMeta.action === "clear" && inputValue.length) {
      setInputValue("");
      return;
    }
    onChange?.(newValue, actionMeta);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " && !inputValue) e.preventDefault();
    props.onKeyDown?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    handleFocusRelatedTarget(e);
  };

  const getNoOptionsMessage = () =>
    dependentFieldLabel
      ? `${t("common.select.please_select")}${dependentFieldLabel}${t(
          "common.select.first",
        )}`
      : t("common.select.no_options");

  const baseStyles = createSelectStyles<Option, IsMulti, Group>({
    ...props,
    readonlyBackGroundColor,
  });

  const mergedStyles: SelectPropsBase<Option, IsMulti, Group>["styles"] =
    props.styles ? { ...baseStyles, ...props.styles } : baseStyles;

  const commonProps: CommonProps<Option, IsMulti, Group> = {
    className: cn(
      "group w-full text-base dark:bg-neutral-200",
      props.className,
      {
        "pointer-events-none": readOnly,
      },
    ),
    isDisabled: !!props.isDisabled || readOnly,
    inputId: id,
    instanceId: `${id}-instance`,
    menuPlacement: "auto",
    menuPortalTarget: typeof window !== "undefined" ? document.body : null,
    menuPosition: "fixed",
    components: {
      ...props.components,
    },
    inputValue,
    onInputChange: handleInputChange,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    noOptionsMessage: props.noOptionsMessage ?? getNoOptionsMessage,
    placeholder: props.placeholder ?? "",
    tabSelectsValue: false,
    backspaceRemovesValue: false,
    filterOption: customFilterOption,
    styles: mergedStyles,
  };

  return { inputValue, commonProps };
}
