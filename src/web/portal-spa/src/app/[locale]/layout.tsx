import "@/styles/globals.css"; // https://github.com/vercel/next.js/discussions/49607#discussioncomment-5957181

import { NextIntlClientProvider } from "next-intl";
import React from "react";
import { ThemeProvider } from "@common/components/ui/theme-provider";
import { cn } from "@common/lib/core/utils";
import { getMessages } from "next-intl/server";
import localFont from "next/font/local";

const inter = localFont({
  src: [
    {
      path: "../../../public/fonts/Inter-VariableFont_opsz,wght.ttf",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Inter-Italic-VariableFont_opsz,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-inter",
});

export const metadata = {
  title: "Hệ thống tích hợp, chia sẻ dữ liệu",
  description: "Trung tâm sáng tạo, khai thác dữ liệu",
  icons: {
    icon: "/image/logo.png",
    shortcut: "/image/logo.png",
    apple: "/image/logo.png",
  },
};

import MinimalLayoutProvider from "@common/components/layout/MinimalLayoutProvider";

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      className="scrollbar-none scroll-smooth"
    >
      <body className={cn(inter.variable, inter.className)}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            disableTransitionOnChange
            enableSystem
            attribute="class"
            defaultTheme="light"
          >
            <MinimalLayoutProvider>{children}</MinimalLayoutProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
