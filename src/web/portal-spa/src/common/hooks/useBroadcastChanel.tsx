import { useEffect, useRef } from "react";

export enum BroadcastChannelName {
  AUTH = "auth",
}

export enum AuthMessageType {
  LOGOUT = "logout",
}

export interface AuthChannelMessage {
  type: AuthMessageType;
}

export interface BroadcastChannelMap {
  [BroadcastChannelName.AUTH]: AuthChannelMessage;
}

export const useBroadcastChannel = <
  K extends keyof BroadcastChannelMap,
  Msg extends BroadcastChannelMap[K] = BroadcastChannelMap[K],
>(params: {
  channel: K;
  callBack?: (msg: Msg) => void;
  typeMsg?: Msg["type"];
}) => {
  const { channel, callBack, typeMsg } = params;
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const bc = new BroadcastChannel(channel);
    channelRef.current = bc;

    const handleMessage = (event: MessageEvent<Msg>) => {
      if (event.data.type === typeMsg) {
        callBack?.(event.data);
      }
    };

    bc.addEventListener("message", handleMessage);

    return () => {
      bc.removeEventListener("message", handleMessage);
      bc.close();
    };
  }, [channel]);

  const sendMessage = (msg: Msg) => {
    channelRef.current?.postMessage(msg);
  };

  return { sendMessage };
};
