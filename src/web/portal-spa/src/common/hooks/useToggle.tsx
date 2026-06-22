import { useCallback, useState } from "react";

export const useToggle = (defaultValue?: boolean) => {
  const [value, setValue] = useState(Boolean(defaultValue));

  const toggle = useCallback((value?: boolean) => {
    setValue((pre) => (typeof value === "boolean" ? value : !pre));
  }, []);

  return {
    value,
    toggle,
  };
};
