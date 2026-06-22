import type {
  CSSObjectWithLabel,
  ControlProps,
  GroupBase,
  OptionProps,
  StylesConfig,
} from "react-select";
import { describe, expect, it } from "vitest";
import { createSelectStyles } from "@common/lib/core/select";

type TestOption = {
  label: string;
  value: string;
};

type TestGroup = GroupBase<TestOption>;

type Styles = StylesConfig<TestOption, false, TestGroup>;

const baseCss = (
  overrides: Partial<CSSObjectWithLabel> = {},
): CSSObjectWithLabel => ({
  ...overrides,
});

const controlProps = (
  overrides: Partial<ControlProps<TestOption, false, TestGroup>> = {},
): ControlProps<TestOption, false, TestGroup> =>
  ({
    isDisabled: false,
    isMulti: false,
    menuIsOpen: false,
    ...overrides,
  }) as ControlProps<TestOption, false, TestGroup>;

const optionProps = (
  overrides: Partial<OptionProps<TestOption, false, TestGroup>> = {},
): OptionProps<TestOption, false, TestGroup> =>
  ({
    isFocused: false,
    isSelected: false,
    isDisabled: false,
    isMulti: false,
    ...overrides,
  }) as OptionProps<TestOption, false, TestGroup>;

describe("createSelectStyles", () => {
  it("menu có paddingBottom khác nhau khi có/không có createLabel", () => {
    const stylesWithoutLabel = createSelectStyles<TestOption, false, TestGroup>(
      {
        createLabel: undefined,
      },
    );

    const stylesWithLabel = createSelectStyles<TestOption, false, TestGroup>({
      createLabel: "create-label",
    });

    const base = baseCss();

    const menuWithout = stylesWithoutLabel.menu?.(base, {} as never);
    const menuWith = stylesWithLabel.menu?.(base, {} as never);

    expect(menuWithout?.paddingBottom).toBe("0.25rem");
    expect(menuWith?.paddingBottom).toBe("0");
  });

  it("control: backgroundColor & border khi disabled / readOnly", () => {
    // case 1: disabled, không readOnly
    const styles1 = createSelectStyles<TestOption, false, TestGroup>({
      readOnly: false,
      readonlyBackGroundColor: "var(--neutral-0)",
    });

    const ctrl1 = styles1.control?.(
      baseCss(),
      controlProps({ isDisabled: true }),
    );

    expect(ctrl1?.backgroundColor).toBe("var(--neutral-100)");
    expect(ctrl1?.border).toBe("none");

    // case 2: readOnly, không disabled
    const styles2 = createSelectStyles<TestOption, false, TestGroup>({
      readOnly: true,
      readonlyBackGroundColor: "var(--custom-bg)",
    });

    const ctrl2 = styles2.control?.(
      baseCss(),
      controlProps({ isDisabled: false }),
    );

    expect(ctrl2?.backgroundColor).toBe("var(--custom-bg)");
    expect(ctrl2?.border).toBe("none");
  });

  it("control: maxControlHeight thêm maxHeight", () => {
    const styles = createSelectStyles<TestOption, false, TestGroup>({
      maxControlHeight: 4,
    });

    const ctrl = styles.control?.(
      baseCss(),
      controlProps({ isDisabled: false }),
    );

    expect(ctrl?.maxHeight).toBe("min(4rem, 30vh)");
  });

  it("control: hasLeftBorderRadius chỉnh lại shape + borderColor", () => {
    const styles = createSelectStyles<TestOption, false, TestGroup>({
      hasLeftBorderRadius: true,
    });

    const ctrl = styles.control?.(
      baseCss(),
      controlProps({ isMulti: false, menuIsOpen: true }),
    );

    expect(ctrl?.borderRadius).toBe("0");
    expect(ctrl?.borderTopLeftRadius).toBe("0.25rem");
    expect(ctrl?.borderBottomLeftRadius).toBe("0.25rem");
    expect(ctrl?.borderColor).toBe("var(--neutral-300)");
    expect(ctrl?.boxShadow).toBe("var(--I-X0-Y0-B6-S0-30)");
  });

  it("control: hasRightBorderRadius bỏ border trái", () => {
    const styles = createSelectStyles<TestOption, false, TestGroup>({
      hasRightBorderRadius: true,
    });

    const ctrl = styles.control?.(baseCss(), controlProps({}));

    expect(ctrl?.borderTopLeftRadius).toBe("0");
    expect(ctrl?.borderBottomLeftRadius).toBe("0");
    expect(ctrl?.borderLeft).toBe("0");
  });

  it("indicatorsContainer chỉ có khi maxControlHeight & isOverflowY", () => {
    const styles = createSelectStyles<TestOption, false, TestGroup>({
      maxControlHeight: 3,
      isOverflowY: true,
    }) as Styles;

    expect(styles.indicatorsContainer).toBeDefined();

    const ind = styles.indicatorsContainer?.(baseCss(), {} as never);

    expect(ind?.position).toBe("sticky");
    expect(ind?.top).toBe("50%");
    expect(ind?.translate).toBe("0 -50%");
  });

  it("input: set maxWidth khi có width", () => {
    const styles = createSelectStyles<TestOption, false, TestGroup>({
      width: 200,
    }) as Styles;

    const input = styles.input?.(baseCss(), {} as never);
    expect(input?.maxWidth).toBe(160); // 200 - 40
  });

  it("placeholder: color phụ thuộc isDisabled", () => {
    const stylesDisabled = createSelectStyles<TestOption, false, TestGroup>({
      isDisabled: true,
      isMulti: false,
    }) as Styles;

    const stylesEnabled = createSelectStyles<TestOption, false, TestGroup>({
      isDisabled: false,
      isMulti: false,
    }) as Styles;

    const base = baseCss();

    const phDisabled = stylesDisabled.placeholder?.(base, {} as never);
    const phEnabled = stylesEnabled.placeholder?.(base, {} as never);

    expect(phDisabled?.color).toBe("var(--neutral-200)");
    expect(phEnabled?.color).toBe("var(--neutral-300)");
  });

  it("placeholder: paddingLeft = 0.5rem khi isMulti true", () => {
    const styles = createSelectStyles<TestOption, true, TestGroup>({
      isDisabled: false,
      isMulti: true,
    });

    const base = baseCss();
    const ph = styles.placeholder?.(base, {} as never);

    expect(ph?.paddingLeft).toBe("0.5rem");
  });

  it("option: dùng getBackgroundColor cho backgroundColor", () => {
    const styles = createSelectStyles<TestOption, false, TestGroup>(
      {},
    ) as Styles;

    const base = baseCss({ backgroundColor: "var(--neutral-50)" });

    // case 1: isFocused -> var(--primary-50)
    const optFocused = styles.option?.(
      base,
      optionProps({ isFocused: true, isSelected: false }),
    );
    expect(optFocused?.backgroundColor).toBe("var(--primary-50)");

    // case 2: isSelected -> màu mặc định trong getBackgroundColor: var(--neutral-0)
    const optSelected = styles.option?.(
      base,
      optionProps({ isFocused: false, isSelected: true }),
    );
    expect(optSelected?.backgroundColor).toBe("var(--neutral-0)");

    // case 3: normal -> dùng backgroundColor của base
    const optNormal = styles.option?.(
      base,
      optionProps({ isFocused: false, isSelected: false }),
    );
    expect(optNormal?.backgroundColor).toBe("var(--neutral-50)");
  });

  it("multiValue có style border & background đúng", () => {
    const styles = createSelectStyles<TestOption, false, TestGroup>(
      {},
    ) as Styles;

    const mv = styles.multiValue?.(baseCss(), {} as never);
    expect(mv?.border).toBe("1px solid var(--neutral-200)");
    expect(mv?.background).toBe("var(--neutral-50)");
  });

  it("noOptionsMessage set fontSize, fontStyle, color", () => {
    const styles = createSelectStyles<TestOption, false, TestGroup>(
      {},
    ) as Styles;

    const noOpt = styles.noOptionsMessage?.(baseCss(), {} as never);
    expect(noOpt?.fontSize).toBe("var(--font-size)");
    expect(noOpt?.fontStyle).toBe("italic");
    expect(noOpt?.color).toBe("var(--neutral-800)");
  });

  it("singleValue set color & marginLeft", () => {
    const styles = createSelectStyles<TestOption, false, TestGroup>(
      {},
    ) as Styles;

    const sv = styles.singleValue?.(baseCss(), {} as never);
    expect(sv?.color).toBe("var(--neutral-800)");
    expect(sv?.marginLeft).toBe(0);
  });
});
