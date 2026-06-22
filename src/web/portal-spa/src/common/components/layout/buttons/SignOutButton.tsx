"use client";

import { Button } from "@common/components/ui/button";

import { SignOut } from "@common/components/icons";

import {
  AuthMessageType,
  BroadcastChannelName,
  useBroadcastChannel,
} from "@common/hooks/useBroadcastChanel";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useRecentlyVisitedService } from "@common/components/layout/providers/RecentlyVisitedServiceStore";

export default function SignOutButton() {
  const t = useLayoutStore((state) => state.t);
  const clear = useRecentlyVisitedService((s) => s.clear);
  const { sendMessage } = useBroadcastChannel({
    channel: BroadcastChannelName.AUTH,
  });

  const handleLogout = () => {
    clear();
    sendMessage({ type: AuthMessageType.LOGOUT });
  };

  return (
    <Button
      className="group flex h-12 w-full items-center justify-start gap-3 rounded-t-none border-t border-t-neutral-100 px-6 py-3 text-inherit focus:shadow-none focus-visible:shadow-none dark:hover:text-neutral-dark-900"
      variant="text"
      onClick={handleLogout}
    >
      <div>
        <SignOut className="text-neutral-700 group-hover:text-primary-200 dark:text-neutral-dark-900" />
      </div>
      <span> {t("auth.sign_out")}</span>
    </Button>
  );
}
