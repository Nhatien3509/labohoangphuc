import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import {
  type LayoutStore,
  useLayoutStore,
} from "@common/components/layout/providers/LayoutStoreProvider";
import { useDayOfWeek } from "@common/hooks/useDayOfWeek";

/* ---------- mocks ---------- */
vi.mock("@common/components/layout/providers/LayoutStoreProvider", () => ({
  useLayoutStore: vi.fn(),
}));

const mockUseLayoutStore = vi.mocked(useLayoutStore);

const mockLayoutStore = {
  t: (key: string) => `translated:${key}`,
} as unknown as LayoutStore;

/* ---------- test enum ---------- */
enum TestDayEnum {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  SUNDAY = "sunday",
}

/* ---------- tests ---------- */
describe("useDayOfWeek", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLayoutStore.mockImplementation((selector) =>
      selector(mockLayoutStore),
    );
  });

  it("should return options mapped from enum", () => {
    const { result } = renderHook(() => useDayOfWeek(TestDayEnum));

    expect(result.current).toEqual([
      {
        value: TestDayEnum.MONDAY,
        label: "translated:common.days_of_the_week.monday",
      },
      {
        value: TestDayEnum.TUESDAY,
        label: "translated:common.days_of_the_week.tuesday",
      },
      {
        value: TestDayEnum.SUNDAY,
        label: "translated:common.days_of_the_week.sunday",
      },
    ]);
  });

  it("should keep enum type for value", () => {
    const { result } = renderHook(() => useDayOfWeek(TestDayEnum));

    const lastDay = result.current.at(-1);

    // runtime
    expect(lastDay?.value).toBe(TestDayEnum.SUNDAY);

    // compile-time (type safety)
    const typedValue: TestDayEnum | undefined = lastDay?.value;
    expect(typedValue).toBeDefined();
  });
});
