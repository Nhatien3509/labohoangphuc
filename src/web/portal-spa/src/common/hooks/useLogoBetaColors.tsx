"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export const useLogoBetaColors = () => {
  const { theme } = useTheme();

  const lightColorPrimary = "var(--primary-100)";
  const lightColorText = "var(--neutral-900)";
  const darkColor = "var(--neutral-0)";

  const [fillPrimary, setFillPrimary] = useState(lightColorPrimary);
  const [fillText, setFillText] = useState(lightColorText);
  const [fillBeta, setFillBeta] = useState("#73777A");

  useEffect(() => {
    if (theme === "light") {
      setFillPrimary(lightColorPrimary);
      setFillText(lightColorText);
      setFillBeta("#73777A");
    } else if (theme === "dark") {
      setFillPrimary(darkColor);
      setFillText(darkColor);
      setFillBeta(darkColor);
    }
  }, [theme]);

  return { fillPrimary, fillText, fillBeta };
};
