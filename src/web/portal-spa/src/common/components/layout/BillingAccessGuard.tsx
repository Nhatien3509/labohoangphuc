"use client";

import LinkProjectBillingAccountDialog from "@common/components/dialogs/LinkProjectBillingAccountDialog";

import React from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

function BillingAccessGuard({
  stayAtCurrentPage = false,
  defaultOpen = true,
  isAccessible,
  children,
}: Readonly<{
  stayAtCurrentPage?: boolean;
  defaultOpen?: boolean;
  isAccessible: boolean;
  children: React.ReactNode;
}>) {
  const { billingAccount } = useLayoutStore((state) => ({
    billingAccount: state.billingAccount ?? undefined,
  }));

  return isAccessible ? (
    children
  ) : (
    <LinkProjectBillingAccountDialog
      billingAccount={billingAccount}
      stayAtCurrentPage={stayAtCurrentPage}
      defaultOpen={defaultOpen}
    />
  );
}

export default BillingAccessGuard;
