"use client";

import { Button } from "@common/components/ui/button";
import IconWithTooltip from "@common/components/containers/IconWithTooltip";

import { Moon, Sun } from "@common/components/icons";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useTheme } from "next-themes";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const { t } = useLayoutStore((state) => state);

  return (
    <Button
      className={cn(
        "h-auto p-0 text-neutral-700 dark:text-neutral-dark-300",
        "hover:text-primary-200 dark:hover:text-neutral-0",
        "focus-visible:shadow-none dark:focus-visible:shadow-none",
        "focus:shadow-none dark:focus:shadow-none",
        "active:shadow-none dark:active:shadow-none max-lg:hidden",
      )}
      variant={"text"}
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
    >
      <IconWithTooltip
        tooltipProps={{
          content:
            theme === "light"
              ? t("header.modes.dark")
              : t("header.modes.light"),
        }}
      >
        <>
          <Sun className="absolute scale-0 base-transition dark:rotate-0 dark:scale-100" />
          <Moon className="rotate-0 scale-100 base-transition dark:-rotate-90 dark:scale-0" />
        </>
      </IconWithTooltip>
    </Button>
  );
}
