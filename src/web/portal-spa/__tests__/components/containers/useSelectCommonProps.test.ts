import type { GroupBase, Props as SelectPropsBase } from "react-select";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExtraSelectProps } from "@common/components/ui/select";
import type React from "react";
import { customFilterOption } from "@common/lib/helpers/obj";
import { useSelectCommonProps } from "@common/hooks/useSelectCommonProps";

// Mock useLayoutStore: t trả về key luôn (identity)
vi.mock("@common/components/layout/providers/LayoutStoreProvider", () => ({
  useLayoutStore: (selector: (s: { t: (key: string) => string }) => unknown) =>
    selector({ t: (key: string) => key }),
}));

const handleFocusRelatedTargetMock = vi.fn();
vi.mock("@common/components/containers/forms/InputForm", () => ({
  handleFocusRelatedTarget: (...args: unknown[]): void => {
    handleFocusRelatedTargetMock(...args);
  },
}));

type TestOption = {
  label: string;
  value: string;
};

type TestGroup = GroupBase<TestOption>;

type TestProps = SelectPropsBase<TestOption, false, TestGroup> &
  ExtraSelectProps;

const createBaseProps = (overrides: Partial<TestProps> = {}): TestProps => ({
  maxLength: 5,
  placeholder: "Pick something",
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ...overrides,
});

describe("useSelectCommonProps", () => {
  beforeEach(() => {
    handleFocusRelatedTargetMock.mockReset();
  });

  it("khởi tạo với inputValue rỗng và commonProps cơ bản đúng", () => {
    const props = createBaseProps();
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    const { inputValue, commonProps } = result.current;

    expect(inputValue).toBe("");
    expect(commonProps.className).toContain("group w-full");
    expect(commonProps.isDisabled).toBe(false);
    expect(commonProps.inputId).toBe("test");
    expect(commonProps.instanceId).toBe("test-instance");
    expect(commonProps.menuPlacement).toBe("auto");
    expect(commonProps.menuPortalTarget).toBe(document.body);
    expect(commonProps.menuPosition).toBe("fixed");
    expect(commonProps.placeholder).toBe("Pick something");
    expect(commonProps.tabSelectsValue).toBe(false);
    expect(commonProps.backspaceRemovesValue).toBe(false);
    expect(commonProps.filterOption).toBe(customFilterOption);
  });

  it("set className pointer-events-none khi readOnly = true và isDisabled mặc định true", () => {
    const props = createBaseProps({ isDisabled: undefined });
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: true,
        props,
      }),
    );

    const { commonProps } = result.current;

    expect(commonProps.className).toContain("pointer-events-none");
    expect(commonProps.isDisabled).toBe(true);
  });

  it("handleInputChange cập nhật inputValue khi không vượt maxLength", () => {
    const props = createBaseProps({ maxLength: 10 });
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    act(() => {
      result.current.commonProps.onInputChange?.("hello", {
        action: "input-change",
        prevInputValue: "",
      });
    });

    expect(result.current.inputValue).toBe("hello");
  });

  it("handleInputChange cắt inputValue khi vượt maxLength", () => {
    const props = createBaseProps({ maxLength: 3 });
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    act(() => {
      result.current.commonProps.onInputChange?.("abcd", {
        action: "input-change",
        prevInputValue: "",
      });
    });

    expect(result.current.inputValue).toBe("abc");
  });

  it("handleChange với action clear sẽ reset inputValue và không gọi onChange", () => {
    const onChangeMock = vi.fn();
    const props = createBaseProps({ onChange: onChangeMock });
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    // đặt inputValue trước
    act(() => {
      result.current.commonProps.onInputChange?.("abc", {
        action: "input-change",
        prevInputValue: "",
      });
    });
    expect(result.current.inputValue).toBe("abc");

    // gọi onChange với action clear
    act(() => {
      result.current.commonProps.onChange?.(null, {
        action: "clear",
      } as unknown as Parameters<NonNullable<TestProps["onChange"]>>[1]);
    });

    expect(result.current.inputValue).toBe("");
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it("handleChange với action khác clear sẽ gọi onChange", () => {
    const onChangeMock = vi.fn();
    const props = createBaseProps({ onChange: onChangeMock });
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    const option: TestOption = { label: "A", value: "a" };

    act(() => {
      result.current.commonProps.onChange?.(option, {
        action: "select-option",
      } as unknown as Parameters<NonNullable<TestProps["onChange"]>>[1]);
    });

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock.mock.calls[0]?.[0]).toEqual(option);
  });

  it("handleKeyDown chặn phím space khi inputValue rỗng", () => {
    const props = createBaseProps();
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    const preventDefault = vi.fn();
    const event = {
      key: " ",
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLDivElement>;

    act(() => {
      return result.current.commonProps.onKeyDown?.(event);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("handleKeyDown không chặn phím space khi inputValue không rỗng", () => {
    const props = createBaseProps();
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    // set inputValue
    act(() => {
      result.current.commonProps.onInputChange?.("x", {
        action: "input-change",
        prevInputValue: "",
      });
    });

    const preventDefault = vi.fn();
    const event = {
      key: " ",
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLDivElement>;

    act(() => {
      result.current.commonProps.onKeyDown?.(event);
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("handleKeyDown gọi props.onKeyDown kể cả khi chặn space", () => {
    const onKeyDownMock = vi.fn();
    const props = createBaseProps({ onKeyDown: onKeyDownMock });

    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );
    const preventDefault = vi.fn();
    const event = {
      key: " ",
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLDivElement>;

    act(() => {
      result.current.commonProps.onKeyDown?.(event);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(onKeyDownMock).toHaveBeenCalledTimes(1);
    expect(onKeyDownMock).toHaveBeenCalledWith(event);
  });

  it("handleKeyDown gọi props.onKeyDown khi inputValue không rỗng", () => {
    const onKeyDownMock = vi.fn();
    const props = createBaseProps({ onKeyDown: onKeyDownMock });

    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    // set inputValue trước
    act(() => {
      result.current.commonProps.onInputChange?.("x", {
        action: "input-change",
        prevInputValue: "",
      });
    });
    const preventDefault = vi.fn();

    const event = {
      key: " ",
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLDivElement>;

    act(() => {
      result.current.commonProps.onKeyDown?.(event);
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(onKeyDownMock).toHaveBeenCalledTimes(1);
    expect(onKeyDownMock).toHaveBeenCalledWith(event);
  });

  it("handleBlur gọi props.onBlur và handleFocusRelatedTarget", () => {
    const onBlurMock = vi.fn();
    const props = createBaseProps({ onBlur: onBlurMock });
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    const event = {} as React.FocusEvent<HTMLInputElement>;

    act(() => {
      result.current.commonProps.onBlur?.(event);
    });

    expect(onBlurMock).toHaveBeenCalledTimes(1);
    expect(handleFocusRelatedTargetMock).toHaveBeenCalledTimes(1);
  });

  it("noOptionsMessage dùng key no_options khi không có dependentFieldLabel", () => {
    const props = createBaseProps({ dependentFieldLabel: undefined });
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    const msg = result.current.commonProps.noOptionsMessage?.({
      inputValue: "",
    });

    expect(msg).toBe("common.select.no_options");
  });

  it("noOptionsMessage ghép chuỗi khi có dependentFieldLabel", () => {
    const props = createBaseProps({ dependentFieldLabel: " X" });
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    const msg = result.current.commonProps.noOptionsMessage?.({
      inputValue: "",
    });

    // t là identity: t("something") => "something"
    expect(msg).toBe("common.select.please_select Xcommon.select.first");
  });

  it("styles được merge: props.styles override baseStyles", () => {
    const overrideStyles: TestProps["styles"] = {
      control: (base) => ({
        ...base,
        borderColor: "red",
      }),
    };

    const props = createBaseProps({ styles: overrideStyles });
    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    const { styles } = result.current.commonProps;
    expect(styles).toBeDefined();
    expect(styles?.control).toBe(overrideStyles.control);
  });

  it("placeholder fallback về chuỗi rỗng khi props.placeholder undefined", () => {
    const props = createBaseProps();
    delete (props as Partial<TestProps>).placeholder;

    const { result } = renderHook(() =>
      useSelectCommonProps<TestOption, false, TestGroup>({
        id: "test",
        readOnly: false,
        props,
      }),
    );

    expect(result.current.commonProps.placeholder).toBe("");
  });
});
