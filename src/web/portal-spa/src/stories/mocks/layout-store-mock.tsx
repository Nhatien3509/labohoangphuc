import * as React from "react";

/** Mock provider: chỉ cần để không crash */
export const LayoutStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;

/** Mock hook: trả về state tối thiểu mà code dùng tới */
export const useLayoutStore = <T,>(
  selector?: (s: { t: (k: string) => string }) => T,
) => {
  const state = { t: (key: string) => key }; // i18n mock: trả về chính key
  return selector ? selector(state) : (state as unknown as T);
};
