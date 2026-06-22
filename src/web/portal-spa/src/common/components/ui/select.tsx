"use client";

import ReactSelect, { type Props } from "react-select";
import React from "react";
import { useSelectCommonProps } from "@common/hooks/useSelectCommonProps";

export type ExtraSelectProps = {
  createLabel?: React.ReactNode;
  onCreate?: () => void;
  hasLeftBorderRadius?: boolean;
  hasRightBorderRadius?: boolean;
  hasError?: boolean;
  isAllowedAccess?: boolean;
  isCreatable?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  width?: number;
  dependentFieldLabel?: string;
  maxControlHeight?: number;
  isOverflowY?: boolean;
};
export interface SelectProps extends Props, ExtraSelectProps {}

export type MenuListExtraProps = {
  createLabel?: React.ReactNode;
  onCreate?: () => void;
  isCreatable?: boolean;
};

const Select = React.forwardRef<
  React.ElementRef<typeof ReactSelect>,
  React.ComponentPropsWithoutRef<typeof ReactSelect> & ExtraSelectProps
>(({ id, readOnly, ...props }, ref) => {
  const { inputValue, commonProps } = useSelectCommonProps({
    id,
    readOnly,
    props,
  });

  return (
    <ReactSelect
      openMenuOnFocus
      {...props}
      {...(inputValue &&
        !props.isMulti && {
          value: { value: inputValue, label: inputValue },
          isClearable: true,
        })}
      ref={ref}
      {...commonProps}
    />
  );
});

Select.displayName = "Select";

export default Select;
