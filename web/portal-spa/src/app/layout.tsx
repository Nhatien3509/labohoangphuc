import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { ThemeProvider } from "@common/components/layout/providers/ThemeProvider";
import { Toaster } from "@common/components/ui/sonner";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Labo Hoàng Phúc — Tra cứu bảo hành",
  description: "Cổng tra cứu & quản lý thẻ bảo hành Labo Hoàng Phúc",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
