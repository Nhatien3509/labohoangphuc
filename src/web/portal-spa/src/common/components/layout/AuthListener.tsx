"use client";

import {
  AuthMessageType,
  BroadcastChannelName,
  useBroadcastChannel,
} from "@common/hooks/useBroadcastChanel";
import { BASE_PATH } from "@common/lib/core/const";
import { useFeatureFlag } from "@common/hooks/useFeatureFlags";

export default function AuthListener() {
  const isUseBasicAuthEnaled = useFeatureFlag("useBasicAuth.enabled");
  const handleLogout = () => {
    const logoutHref = isUseBasicAuthEnaled
      ? `${BASE_PATH}/auth/basic-auth/logout`
      : `${BASE_PATH}/auth/sso/logout`;
    window.location.href = logoutHref;
  };

  useBroadcastChannel({
    channel: BroadcastChannelName.AUTH,
    callBack: handleLogout,
    typeMsg: AuthMessageType.LOGOUT,
  });

  return null;
}
