import Link from "next/link";

import { LANDING_PAGE_URL } from "@common/lib/core/const";
import { getCookies } from "@common/lib/core/server-side";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("layout.footer");
  const { NEXT_LOCALE } = getCookies(["NEXT_LOCALE"]);
  const links = {
    terms:
      NEXT_LOCALE === "en"
        ? `${LANDING_PAGE_URL}/en/term`
        : `${LANDING_PAGE_URL}/dieu-khoan`,
    privacy:
      NEXT_LOCALE === "en"
        ? `${LANDING_PAGE_URL}/en/privacy/privacy`
        : `${LANDING_PAGE_URL}/privacy/chinh-sach`,
  };

  return (
    <footer className="flex h-[1.875rem] items-center justify-center gap-2.5 bg-neutral-800 p-2.5 text-base font-medium text-neutral-0 dark:bg-neutral-dark-0 dark:text-neutral-0 max-md:h-fit max-md:flex-col max-md:gap-3 max-md:p-6">
      <div className="flex items-center justify-center gap-2.5">
        <Link
          className="hover:underline"
          href={links.terms}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t("terms")}
        </Link>
        <span>|</span>
        <Link
          className="hover:underline"
          href={links.privacy}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t("privacy")}
        </Link>
        <span>|</span>
      </div>

      <p className="max-md:item-center max-md:flex max-md:flex-col max-md:justify-center">
        {t("copyright")}
      </p>
    </footer>
  );
}
