"use client";

import Link from "next/link";

import React from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useReturnUrl } from "@common/hooks/useReturnUrl";

const SignInButton = () => {
  const { t } = useLayoutStore((state) => state);
  const { getReturnUrl } = useReturnUrl();

  return (
    <Link className="block w-full" href={getReturnUrl("/login")}>
      <span>{`${t("auth.sign_in")} / ${t("auth.sign_up")}`}</span>
    </Link>
  );
};

export default SignInButton;
