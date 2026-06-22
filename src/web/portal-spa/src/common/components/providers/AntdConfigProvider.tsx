"use client";

import { ConfigProvider } from "antd";
import type { ReactNode } from "react";

export default function AntdConfigProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <ConfigProvider
      theme={{
        token: {
          controlHeight: 30,
          controlHeightSM: 26,
          controlHeightLG: 34,
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
