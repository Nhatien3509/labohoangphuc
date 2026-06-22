// For mobile resolutions

import { Cart, Documentation, LandingPage } from "@common/components/icons";
import Link from "next/link";
import UserNavDropdownItem from "@common/components/layout/user-nav/UserNavDropdownItem";

import { DOCS_PAGE_URL, LANDING_PAGE_URL } from "@common/lib/core/const";
import { ROUTES } from "@common/lib/core/routes";
import React from "react";
import { useTranslations } from "next-intl";

function UserNavQuickAccess() {
  const t = useTranslations("layout");

  return (
    <UserNavDropdownItem
      title={t("quick_access")}
      className="cursor-pointer rounded-none border-t border-t-neutral-100 lg:hidden"
    >
      <Link
        href={DOCS_PAGE_URL}
        rel="noopener noreferrer"
        target="_blank"
        className="flex items-center gap-3 px-6 py-3"
      >
        <Documentation />
        <span>{t("header.documentation")}</span>
      </Link>
      <Link
        href={`${LANDING_PAGE_URL}/news`}
        target="_blank"
        className="flex items-center gap-3 px-6 py-3"
      >
        <LandingPage />
        <span>{t("news")}</span>
      </Link>
      <Link
        href={ROUTES.marketplace.home}
        target="_self"
        className="flex items-center gap-3 px-6 py-3"
      >
        <Cart />
        <span>Marketplace</span>
      </Link>
    </UserNavDropdownItem>
  );
}

export default UserNavQuickAccess;
