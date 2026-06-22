import { type AppLocale, routing } from "./routing";
import { type AbstractIntlMessages } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

const COMMON_MESSAGE_NAMESPACES = new Set(["common", "layout"]);

const isAppLocale = (value: string): value is AppLocale => {
  return routing.locales.includes(value as AppLocale);
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = (await requestLocale) ?? routing.defaultLocale;

  const locale: AppLocale = isAppLocale(requested)
    ? requested
    : routing.defaultLocale;

  const [commonMessages, dashboardMessages] = await Promise.all([
    loadMessages("common"),
    loadMessages("(dashboard)"),
  ]);

  return {
    locale,
    messages: {
      layout: { ...commonMessages },
      dashboard: { ...dashboardMessages },
    },
  };
});

export const loadMessages = async (
  namespaceInput: string,
): Promise<AbstractIntlMessages> => {
  const namespace = namespaceInput.trim();

  if (!namespace) {
    throw new Error("i18n message namespace is required");
  }

  const headersList = Object.fromEntries(headers().entries());
  const headerLocale =
    headersList["x-next-intl-locale"] ?? routing.defaultLocale;
  const locale: AppLocale = isAppLocale(headerLocale)
    ? headerLocale
    : routing.defaultLocale;

  try {
    if (COMMON_MESSAGE_NAMESPACES.has(namespace)) {
      const messagesModule = (await import(
        `@/common/lib/_messages/${locale}.json`
      )) as { default: AbstractIntlMessages };

      return messagesModule.default;
    }

    const messagesModule = (await import(
      `@/app/[locale]/${namespace}/_messages/${locale}.json`
    )) as { default: AbstractIntlMessages };

    return messagesModule.default;
  } catch (_error) {
    return {};
  }
};
