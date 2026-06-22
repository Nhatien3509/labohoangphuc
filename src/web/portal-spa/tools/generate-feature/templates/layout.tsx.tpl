import DialogContainer from "@common/components/containers/dialogs/DialogContainer";

import BreadcrumbWithTitle from "@common/components/layout/breadcrumb/BreadcrumbWithTitle";
import LayoutWithSidebar from "@common/components/layout/LayoutWithSidebar";
import { Overview } from "@common/components/icons";
import SidebarContainers from "@common/components/layout/sidebar/Sidebar";
import { withLoading } from "@common/components/layout/PageGenerator";

import { NextIntlClientProvider, useTranslations } from "next-intl";
import type { BreadcrumbConfig } from "@common/hooks/useBreadcrumb";
import React from "react";
import { loadMessages } from "@/common/lib/i18n/request";

async function {{PASCAL}}Layout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const messages = await loadMessages("{{SLUG}}");

  return (
    <LayoutWithSidebar
      SidebarComponent={<{{PASCAL}}Sidebar />}
      BreadcrumbComponent={<{{PASCAL}}Breadcrumb />}
    >
      <NextIntlClientProvider messages={messages}>
        {children}
        <DialogContainer />
      </NextIntlClientProvider>
    </LayoutWithSidebar>
  );
}

const {{PASCAL}}Breadcrumb = () => {
  const t = useTranslations("shell");
  const breadcrumbConfig: Record<string, BreadcrumbConfig> = {
    "{{SLUG}}": {
      label: null,
      customParents: [
        {
          label: t("title"),
          href: moduleConfig.{{SEGMENT_CAMEL}}.destPath,
        },
      ],
      children: {
        "{{SEGMENT}}": { label: t("items") },
      },
    },
  };

  return <BreadcrumbWithTitle breadcrumbConfig={breadcrumbConfig} />;
};

const {{PASCAL}}Sidebar = () => {
  const t = useTranslations("shell");

  return (
    <SidebarContainers
      title={t("title")}
      items={[
        {
          label: t("items"),
          icon: <Overview />,
          pattern: moduleConfig.{{SEGMENT_CAMEL}}.pattern,
          destPath: moduleConfig.{{SEGMENT_CAMEL}}.destPath,
        },
      ]}
    />
  );
};

/** TODO: replace string paths with ROUTES.{{ROUTES_KEY}} once added to routes.js */
const moduleConfig = {
  {{SEGMENT_CAMEL}}: {
    pattern: "{{SEGMENT}}",
    destPath: "/{{SLUG}}/{{SEGMENT}}",
  },
} as const;

export default withLoading({{PASCAL}}Layout);
