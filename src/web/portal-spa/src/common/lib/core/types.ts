import type { ReactNode } from "react";
import type { SERVICE_NAMES } from "@common/lib/core/const";

export type OptionType = {
  label: string;
  value: string;
  icon?: ReactNode;
};

export type ServiceName = (typeof SERVICE_NAMES)[keyof typeof SERVICE_NAMES];
