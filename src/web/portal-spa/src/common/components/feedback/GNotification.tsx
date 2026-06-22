"use client";

import type { ReactNode } from "react";
import { cn } from "@common/lib/core/utils";

export type GNotificationVariant = "success" | "error";

type Props = Readonly<{
  variant: GNotificationVariant;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}>;

const VARIANT_STYLES: Record<
  GNotificationVariant,
  { container: string; border: string; bg: string; desc: string; icon: string }
> = {
  success: {
    container: "",
    border: "border-[#0bc33f]",
    bg: "bg-[#e1fce9]",
    desc: "text-[#0bc33f]",
    icon: "#0bc33f",
  },
  error: {
    container: "",
    border: "border-[#d80d31]",
    bg: "bg-[#fce1e5]",
    desc: "text-[#d80d31]",
    icon: "#d80d31",
  },
};

function ShieldCheck({ color }: Readonly<{ color: string }>) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 3L6 7v8.2c0 7 4.7 13.5 11 15.3 6.3-1.8 11-8.3 11-15.3V7L17 3z"
        fill={color}
      />
      <path
        d="M11.5 17.2l3.8 3.8 7.2-7.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldX({ color }: Readonly<{ color: string }>) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 3L6 7v8.2c0 7 4.7 13.5 11 15.3 6.3-1.8 11-8.3 11-15.3V7L17 3z"
        fill={color}
      />
      <path
        d="M13 13l8 8M21 13l-8 8"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function GNotification({
  variant,
  title,
  description,
  className,
}: Props) {
  const styles = VARIANT_STYLES[variant];
  return (
    <output
      className={cn(
        "flex w-full items-start gap-4 overflow-hidden rounded-[7px] border px-[14px] py-[17px]",
        styles.bg,
        styles.border,
        className,
      )}
    >
      <div className="shrink-0">
        {variant === "success" ? (
          <ShieldCheck color={styles.icon} />
        ) : (
          <ShieldX color={styles.icon} />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1">
        <p className="text-[15px] font-semibold leading-4 text-[#27314b] dark:text-neutral-dark-900">
          {title}
        </p>
        {description ? (
          <p
            className={cn(
              "text-[13px] font-medium leading-[14px] -tracking-[0.13px]",
              styles.desc,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </output>
  );
}
