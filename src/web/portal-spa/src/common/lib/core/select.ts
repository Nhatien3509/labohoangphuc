import type {
  ControlProps,
  GroupBase,
  OptionProps,
  StylesConfig,
} from "react-select";
import { getBackgroundColor } from "@common/lib/helpers/obj";

/**
 * Generic styles config builder for React-Select & AsyncSelect
 *
 * @param params - style behavior driven by props and context
 */
export function createSelectStyles<
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(params: {
  hasError?: boolean;
  readOnly?: boolean;
  readonlyBackGroundColor?: string;
  maxControlHeight?: number;
  hasLeftBorderRadius?: boolean;
  hasRightBorderRadius?: boolean;
  width?: number;
  isOverflowY?: boolean;
  createLabel?: React.ReactNode;
  isDisabled?: boolean;
  isMulti?: boolean;
}): StylesConfig<Option, IsMulti, Group> {
  const {
    hasError,
    readOnly,
    readonlyBackGroundColor,
    maxControlHeight,
    hasLeftBorderRadius,
    hasRightBorderRadius,
    width,
    isOverflowY,
    createLabel,
    isDisabled,
    isMulti,
  } = params;

  return {
    menu: (provided) => ({
      ...provided,
      zIndex: 99,
      boxShadow: "var(--D-X0-Y0-B10-S0-30)",
      paddingTop: "0.25rem",
      paddingBottom: createLabel ? "0" : "0.25rem",
      borderRadius: "0.25rem",
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
      pointerEvents: "all",
    }),
    control: (base, props: ControlProps<Option, IsMulti, Group>) => {
      const borderColor = getBorderColor(props.menuIsOpen, Boolean(hasError));

      return {
        ...base,
        backgroundColor:
          props.isDisabled && !readOnly
            ? "var(--neutral-100)"
            : readonlyBackGroundColor,
        border: props.isDisabled || readOnly ? "none" : "",
        cursor: "pointer",
        gap: "0.5rem",
        padding: props.isMulti
          ? "0.1875rem 0.5rem 0.1875rem 0.25rem"
          : "0 0.5rem 0 0.75rem",
        minHeight: "2.25rem",
        ...(maxControlHeight && {
          maxHeight: `min(${maxControlHeight}rem, 30vh)`,
        }),
        overflowY: "auto",
        boxShadow: props.menuIsOpen ? "var(--D-X0-Y0-B6-S0-30)" : "none",
        borderColor: hasError ? "var(--red-800)" : "var(--neutral-200)",
        ":hover": {
          boxShadow: "var(--D-X0-Y0-B6-S0-30)",
          borderColor: borderColor,
        },
        ":focus": {
          borderColor: borderColor,
          boxShadow: "var(--D-X0-Y0-B6-S0-30)",
        },
        ":target": {
          borderColor: borderColor,
          boxShadow: "var(--D-X0-Y0-B6-S0-30)",
        },
        ":active": {
          boxShadow: "var(--D-X0-Y0-B6-S0-30)",
          borderColor: borderColor,
        },
        ...(hasRightBorderRadius && {
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
          borderLeft: "0",
        }),
        ...(hasLeftBorderRadius && {
          padding: props.isMulti
            ? "0.1875rem 0.5rem 0.1875rem 0.25rem"
            : "0 0.5rem 0 0.75rem",
          backgroundColor: props.menuIsOpen
            ? "var(--neutral-100)"
            : "var(--neutral-0)",
          borderRadius: "0",
          borderTopLeftRadius: "0.25rem",
          borderBottomLeftRadius: "0.25rem",
          borderColor: props.menuIsOpen
            ? "var(--neutral-300)"
            : "var(--neutral-200)",
          boxShadow: props.menuIsOpen ? "var(--I-X0-Y0-B6-S0-30)" : "",
          ":hover": {
            boxShadow: props.menuIsOpen
              ? "var(--I-X0-Y0-B6-S0-30)"
              : "var(--D-X0-Y0-B6-S0-30)",
            borderColor: "var(--neutral-300)",
          },
          ":focus": {
            borderColor: "var(--neutral-300)",
            boxShadow: "var(--I-X0-Y0-B6-S0-30)",
          },
          ":target": {
            borderColor: "var(--neutral-300)",
            boxShadow: "var(--I-X0-Y0-B6-S0-30)",
          },
          ":active": {
            boxShadow: "var(--I-X0-Y0-B6-S0-30)",
            borderColor: "var(--neutral-300)",
          },
        }),
      };
    },
    valueContainer: (base) => ({
      ...base,
      padding: 0,
      gap: "0.25rem 0.5rem",
    }),
    input: (base) => ({
      ...base,
      ...(width && { maxWidth: width - 40 }),
      margin: 0,
      padding: 0,
    }),
    ...(maxControlHeight &&
      isOverflowY && {
        indicatorsContainer: (base) => ({
          ...base,
          height: "fit-content",
          position: "sticky",
          top: "50%",
          right: "0",
          translate: "0 -50%",
        }),
      }),
    placeholder: (base) => ({
      ...base,
      margin: 0,
      lineHeight: "normal",
      color: isDisabled ? "var(--neutral-200)" : "var(--neutral-300)",
      paddingLeft: isMulti ? "0.5rem" : 0,
    }),
    option: (base, props: OptionProps<Option, IsMulti, Group>) => ({
      ...base,
      fontSize: "var(--font-size)",
      lineHeight: "var(--line-height)",
      padding: "0.5rem 0.75rem 0.5rem 1rem",
      backgroundColor: getBackgroundColor(base, props),
      color: "var(--neutral-800)",
      fontWeight: props.isSelected || props.isFocused ? "500" : "400",
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
    multiValue: (base) => ({
      ...base,
      margin: 0,
      border: "1px solid var(--neutral-200)",
      borderRadius: "0.5rem",
      background: "var(--neutral-50)",
      overflow: "hidden",
      ":hover": {
        backgroundColor: "var(--neutral-100)",
        border: "1px solid var(--neutral-400)",
      },
    }),
    multiValueRemove: (base) => ({
      ...base,
      paddingLeft: "0.125rem",
      borderTopRightRadius: "0.5rem",
      borderBottomRightRadius: "0.5rem",
      ":hover": {
        backgroundColor: "var(--neutral-100)",
        color: "var(--primary-200)",
      },
    }),
    multiValueLabel: (base) => ({
      ...base,
      padding: "0.1875rem 0.25rem",
      paddingLeft: "0.5rem",
      paddingRight: "0.125rem",
      fontSize: "100%",
      color: "var(--neutral-800)",
    }),
    noOptionsMessage: (base) => ({
      ...base,
      fontSize: "var(--font-size)",
      fontStyle: "italic",
      color: "var(--neutral-800)",
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--neutral-800)",
      marginLeft: 0,
    }),
  };
}

const getBorderColor = (isMenuOpen: boolean, hasError: boolean) => {
  if (hasError) {
    return "var(--red-800)";
  }
  return isMenuOpen ? "var(--neutral-500)" : "var(--neutral-400)";
};
