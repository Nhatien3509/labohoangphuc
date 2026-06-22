"use client";

import IconWithTooltip from "@common/components/containers/IconWithTooltip";

import { Documentation } from "@common/components/icons";

import { DOCS_PAGE_URL } from "@common/lib/core/const";
import Link from "next/link";
import React from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const DocumentationButton = () => {
  const { t } = useLayoutStore((state) => state);

  return (
    <Link
      href={DOCS_PAGE_URL}
      rel="noopener noreferrer"
      target="_blank"
      className="max-lg:hidden"
    >
      <IconWithTooltip
        tooltipProps={{
          content: t("header.documentation"),
          isPreventDefault: false,
        }}
      >
        <Documentation className="text-neutral-700 hover:text-primary-200 dark:text-neutral-dark-300" />
      </IconWithTooltip>
    </Link>
  );
};

export default DocumentationButton;
