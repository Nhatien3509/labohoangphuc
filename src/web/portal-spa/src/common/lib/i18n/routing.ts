import { defineRouting } from "next-intl/routing";

export const locales = ["vi", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "vi",
  localePrefix: "never",
  // Không dò ngôn ngữ theo header Accept-Language của trình duyệt — luôn mặc
  // định tiếng Việt trên mọi máy. Vẫn tôn trọng cookie NEXT_LOCALE khi user
  // chủ động đổi ngôn ngữ.
  localeDetection: false,
});
