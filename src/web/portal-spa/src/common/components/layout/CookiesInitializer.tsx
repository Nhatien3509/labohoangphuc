"use client";

import React, { useEffect } from "react";
import { setCookies } from "@common/lib/core/server-actions";

const CookiesInitializer = ({
  cookiesData,
}: {
  cookiesData: Record<string, string>;
}) => {
  useEffect(() => {
    const currentTimezoneOffset = new Date().getTimezoneOffset();
    void setCookies({
      ...cookiesData,
      currentTimezoneOffset: String(currentTimezoneOffset),
    });
  }, []);

  return <></>;
};

export default CookiesInitializer;
