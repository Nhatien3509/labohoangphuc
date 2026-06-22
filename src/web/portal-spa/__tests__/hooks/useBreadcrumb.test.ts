import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { useBreadcrumb } from "@common/hooks/useBreadcrumb";
import { usePathname } from "next/navigation";
const mockUsePathname = vi.mocked(usePathname);

describe("useBreadcrumb", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return correct parents and label for matched path", () => {
    mockUsePathname.mockReturnValue("/users/123/profile");

    const breadcrumbConfig = {
      users: {
        label: "Users",
        children: {
          ":id": {
            label: "User Detail",
            children: {
              profile: {
                label: "Profile",
              },
            },
          },
        },
      },
    };

    const { result } = renderHook(() => useBreadcrumb(breadcrumbConfig));

    expect(result.current.label).toBe("Profile");

    expect(result.current.parents).toEqual([
      { label: "Users", href: "/users" },
      { label: "User Detail", href: "/users/123" },
    ]);
  });

  it("should match dynamic segments", () => {
    mockUsePathname.mockReturnValue("/users/555/profile");

    const breadcrumbConfig = {
      users: {
        label: "Users",
        children: {
          ":id": {
            label: "User Detail",
            children: {
              profile: { label: "Profile" },
            },
          },
        },
      },
    };

    const { result } = renderHook(() => useBreadcrumb(breadcrumbConfig));

    expect(result.current.parents[1]).toEqual({
      label: "User Detail",
      href: "/users/555",
    });
  });

  it("should include customParents", () => {
    mockUsePathname.mockReturnValue("/dashboard/stats");

    const configWithCustom = {
      dashboard: {
        label: "Dashboard",
        customParents: [
          { label: "Home", href: "/home" },
          { label: "Analytics", href: "/analytics" },
        ],
        children: {
          stats: {
            label: "Stats",
          },
        },
      },
    };

    const { result } = renderHook(() => useBreadcrumb(configWithCustom));

    expect(result.current.parents).toEqual([
      { label: "Home", href: "/home" },
      { label: "Analytics", href: "/analytics" },
      { label: "Dashboard", href: "/dashboard" },
    ]);

    expect(result.current.label).toBe("Stats");
  });
});
