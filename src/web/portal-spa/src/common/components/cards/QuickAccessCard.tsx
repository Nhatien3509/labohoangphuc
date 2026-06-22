"use client";

import { Cart, Documentation, LandingPage } from "@common/components/icons";
import CardContainer from "@common/components/containers/cards/CardContainer";
import Hyperlink from "@common/components/containers/Hyperlink";

import React, { cloneElement } from "react";
import { LANDING_PAGE_URL } from "@common/lib/core/const";
import { ROUTES } from "@common/lib/core/routes";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useParams } from "next/navigation";

type QuickAccessLinks = {
  key: string | number;
  label: string;
  url: string;
  icon: React.JSX.Element;
  target: "_self" | "_blank";
};

const QuickAccessCard = () => {
  const { url, t } = useLayoutStore((state) => ({
    url: state.url,
    t: state.t,
  }));
  const { locale } = useParams<{ locale: string }>();
  const documentUrl = `${url.DOCS_URL}${locale === "en" ? "/en/documentation" : "/documentation"}`;
  const quickAccessLinks: QuickAccessLinks[] = [
    {
      key: "docs",
      label: t("docs"),
      url: documentUrl,
      icon: <Documentation />,
      target: "_blank",
    },
    {
      key: "news",
      label: t("news"),
      url: `${LANDING_PAGE_URL}/news`,
      icon: <LandingPage />,
      target: "_blank",
    },
    {
      key: "marketplace",
      label: "Marketplace",
      url: ROUTES.marketplace.home,
      icon: <Cart />,
      target: "_self",
    },
  ];

  return (
    <CardContainer
      className="w-[23.625rem] max-sm:w-full"
      titleNode={t("quick_access")}
    >
      <div className="flex flex-col gap-6">
        {quickAccessLinks.map((item) => (
          <div
            key={item.key}
            className="flex cursor-pointer items-center gap-3 hover:text-primary-100 hover:dark:text-primary-200"
          >
            <div>
              {cloneElement(item.icon as React.ReactElement, {
                className: "text-neutral-700 dark:text-neutral-dark-900",
              })}
            </div>
            <Hyperlink
              customClassName="text-neutral-800"
              href={item.url}
              target={item.target}
              content={item.label}
            />
          </div>
        ))}
      </div>
    </CardContainer>
  );
};

export default QuickAccessCard;
