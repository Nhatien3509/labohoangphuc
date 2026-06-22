import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export type BreadcrumbConfig = {
  label: string | null;
  children?: Record<string, BreadcrumbConfig>;
  customParents?: {
    label: string;
    href: string;
    tooltipContent?: string;
  }[];
};

export function useBreadcrumb(
  breadcrumbConfig: Record<string, BreadcrumbConfig>,
): {
  label: ReactNode;
  parents: {
    label: string;
    href: string;
    tooltipContent?: string;
  }[];
} {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  let currentConfig = breadcrumbConfig;
  let href = "";

  const { label, parents } = segments.reduce(
    (acc, segment) => {
      const matchedKey = Object.keys(currentConfig).find(
        (key) => key.startsWith(":") || key === segment,
      );

      if (!matchedKey) return acc;

      const matchedConfig = currentConfig[matchedKey];
      if (!matchedConfig) return acc;

      href += `/${matchedKey.startsWith(":") ? segment : matchedKey}`;
      const { customParents, label, children } = matchedConfig;

      if (customParents) acc.parents.push(...customParents);

      if (label) {
        acc.parents.push({
          label,
          href,
        });
        acc.label = label;
      }

      currentConfig = children ?? {};
      return acc;
    },
    {
      label: null as string | null,
      parents: [] as { label: string; href: string }[],
    },
  );

  return {
    label,
    parents: parents.slice(0, -1),
  };
}
