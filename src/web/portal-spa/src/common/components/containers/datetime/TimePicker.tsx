"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@common/components/ui/popover";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";

import { Clock } from "@common/components/icons";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

import { useEffect, useRef, useState } from "react";
import { cn } from "@common/lib/core/utils";

type TimePickerProps = {
  placeholder?: string;
  disableMinutes?: boolean;
  isSecondDisabled?: boolean;
  showSeconds?: boolean;
  allowSeconds?: boolean;
  selectedTime?: string;
  minuteStep?: number;
  onChange?: (value: string) => void;
  hasError?: boolean;
  showHours?: boolean;
};

export function TimePicker({
  placeholder = "",
  disableMinutes = false,
  isSecondDisabled = false,
  allowSeconds = false,
  showSeconds = false,
  selectedTime = "",
  onChange,
  minuteStep = 5,
  hasError = false,
  showHours = true,
}: Readonly<TimePickerProps>) {
  const { t } = useLayoutStore((state) => state);

  const [selectedHour, setSelectedHour] = useState<number | null>(
    Number(selectedTime.split(":")[0]),
  );
  const [selectedMinute, setSelectedMinute] = useState<number | null>(
    Number(selectedTime.split(":")[1]),
  );
  const [selectedSecond, setSelectedSecond] = useState<number | null>(
    Number(selectedTime.split(":")[2]),
  );

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const hourRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const minuteRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const secondRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setSelectedHour(selectedTime ? Number(selectedTime.split(":")[0]) : null);
    setSelectedMinute(selectedTime ? Number(selectedTime.split(":")[1]) : null);
    setSelectedSecond(selectedTime ? Number(selectedTime.split(":")[2]) : null);
  }, [selectedTime]);

  useEffect(() => {
    if (!isPopoverOpen) return;
    const timeoutId = setTimeout(() => {
      if (selectedHour !== null && hourRefs.current[selectedHour]) {
        hourRefs.current[selectedHour].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      if (selectedMinute !== null && minuteRefs.current[selectedMinute]) {
        minuteRefs.current[selectedMinute].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      if (selectedSecond !== null && secondRefs.current[selectedSecond]) {
        secondRefs.current[selectedSecond].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPopoverOpen, selectedHour, selectedMinute, selectedSecond]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => i * minuteStep,
  );
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  const buttonContent = () => {
    const hour = String(selectedHour).padStart(2, "0");
    const minute = String(selectedMinute).padStart(2, "0");
    const second = String(selectedSecond).padStart(2, "0");

    if (!showHours) {
      return allowSeconds || showSeconds ? `${minute}:${second}` : minute;
    }

    return allowSeconds || showSeconds
      ? `${hour}:${minute}:${second}`
      : `${hour}:${minute}`;
  };

  return (
    <Popover modal onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <button className="group">
          <Input
            tabIndex={-1}
            className={cn(
              "cursor-pointer hover:!shadow-D-X0-Y0-B6-S0-30 group-aria-expanded:border-neutral-500 group-aria-expanded:!shadow-D-X0-Y0-B6-S0-30",
              "group-focus-visible:border-neutral-500 group-focus-visible:!shadow-D-X0-Y0-B6-S0-30",
              "read-only:border-solid read-only:bg-neutral-0 read-only:!shadow-none",
              !selectedTime && "text-neutral-400",
              {
                "!border-red-800": hasError,
              },
            )}
            readOnly
            value={!selectedTime ? placeholder : buttonContent()}
            rightIcon={<Clock />}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "my-1 w-[var(--radix-popover-trigger-width)] rounded p-0 !shadow-D-X0-Y0-B6-S0-30",
          { "min-w-[12rem]": allowSeconds },
        )}
      >
        <div className="flex h-64 w-full justify-between py-2">
          {showHours && (
            <div
              className={cn(
                "flex w-1/2 flex-col items-center justify-center border-r text-base",
                {
                  "w-1/3": allowSeconds,
                },
              )}
            >
              <span className="w-[3rem] border-b pb-[0.15rem] text-center font-bold">
                {t("common.time_picker.hours")}
              </span>
              <ul className="scrollbar-none mt-1 h-56 overflow-y-auto text-center">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    ref={(el) => {
                      hourRefs.current[hour] = el;
                    }}
                    variant={"text"}
                    className={cn(
                      "mt-2 !h-[1.375rem] cursor-pointer rounded-sm px-2 py-1.5 text-center text-neutral-800 hover:text-neutral-800 active:text-neutral-800",
                      allowSeconds
                        ? "w-[2.215rem]"
                        : "w-full focus-visible:bg-primary-50 focus-visible:text-neutral-800 focus-visible:shadow-none",
                      "hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:text-neutral-800 focus-visible:shadow-none",
                      {
                        "bg-primary-100 text-neutral-0 hover:bg-primary-100 hover:text-neutral-0 focus-visible:bg-primary-100 focus-visible:text-neutral-0 active:text-neutral-0":
                          hour === selectedHour,
                      },
                    )}
                    onClick={() => {
                      setSelectedHour(hour);
                      const updatedTime = `${String(hour).padStart(
                        2,
                        "0",
                      )}:${String(selectedMinute ?? 0).padStart(
                        2,
                        "0",
                      )}:${String(selectedSecond ?? 0).padStart(2, "0")}`;
                      onChange?.(updatedTime);
                    }}
                  >
                    {String(hour).padStart(2, "0")}
                  </Button>
                ))}
              </ul>
            </div>
          )}

          <div
            className={cn(
              "flex w-1/2 flex-col items-center justify-center text-base",
              {
                "w-1/3 border-r": allowSeconds && showHours,
                "w-full": !allowSeconds && !showHours,
              },
            )}
          >
            <span
              className={cn(
                "w-[3rem] border-b pb-[0.15rem] text-center font-bold",
                disableMinutes ? "text-neutral-200" : "",
              )}
            >
              {t("common.time_picker.minutes")}
            </span>
            <ul className="scrollbar-none mt-1 flex h-56 w-full flex-col items-center overflow-y-auto">
              {minutes.map((minute) => (
                <Button
                  key={minute}
                  ref={(el) => {
                    minuteRefs.current[minute] = el;
                  }}
                  tabIndex={disableMinutes ? -1 : 0}
                  variant={"text"}
                  className={cn(
                    "mt-2 !h-[1.375rem] w-full cursor-pointer rounded-sm px-2 py-1.5 text-center",
                    "focus-visible:bg-primary-50 focus-visible:text-neutral-800 focus-visible:shadow-none active:text-neutral-800",
                    {
                      "w-[2.215rem]":
                        allowSeconds ||
                        (minuteStep !== 1 && showHours && !disableMinutes),
                    },
                    disableMinutes
                      ? "pointer-events-none text-neutral-200"
                      : "hover:bg-primary-50 hover:text-neutral-800 active:text-neutral-800",
                    minute === selectedMinute &&
                      (disableMinutes
                        ? "pointer-events-none bg-neutral-200 text-neutral-0"
                        : "bg-primary-100 text-neutral-0 hover:bg-primary-100 hover:text-neutral-0 focus-visible:bg-primary-100 focus-visible:text-neutral-0 focus-visible:shadow-none active:text-neutral-0"),
                  )}
                  onClick={() => {
                    if (!disableMinutes) {
                      setSelectedMinute(minute);
                      const updatedTime = `${String(selectedHour ?? 0).padStart(
                        2,
                        "0",
                      )}:${String(minute).padStart(
                        2,
                        "0",
                      )}:${String(selectedSecond ?? 0).padStart(2, "0")}`;
                      onChange?.(updatedTime);
                    }
                  }}
                >
                  {String(minute).padStart(2, "0")}
                </Button>
              ))}
            </ul>
          </div>

          {allowSeconds && (
            <div className="flex w-1/3 flex-col items-center justify-center text-base">
              <span
                className={cn(
                  "w-[3rem] border-b pb-[0.15rem] text-center font-bold",
                  isSecondDisabled ? "text-neutral-200" : "",
                )}
              >
                {t("common.time_picker.seconds")}
              </span>
              <ul className="scrollbar-none mt-1 h-56 overflow-y-auto text-center">
                {seconds.map((second) => (
                  <Button
                    key={second}
                    ref={(el) => {
                      secondRefs.current[second] = el;
                    }}
                    variant={"text"}
                    tabIndex={isSecondDisabled ? -1 : 0}
                    className={cn(
                      "mt-2 !h-[1.375rem] w-[2.215rem] cursor-pointer rounded-sm px-2 py-1.5 text-center",
                      "focus-visible:bg-primary-50 focus-visible:text-neutral-800 focus-visible:shadow-none active:text-neutral-800",
                      isSecondDisabled
                        ? "pointer-events-none text-neutral-200"
                        : "hover:bg-primary-50 hover:text-neutral-800 active:text-neutral-800",
                      second === selectedSecond &&
                        (isSecondDisabled
                          ? "pointer-events-none bg-neutral-200 text-neutral-0"
                          : "bg-primary-100 text-neutral-0 hover:bg-primary-100 hover:text-neutral-0 focus-visible:bg-primary-100 focus-visible:text-neutral-0 focus-visible:shadow-none active:text-neutral-0"),
                    )}
                    onClick={() => {
                      if (!isSecondDisabled) {
                        setSelectedSecond(second);
                        const updatedTime = `${String(
                          selectedHour ?? 0,
                        ).padStart(2, "0")}:${String(
                          selectedMinute ?? 0,
                        ).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
                        onChange?.(updatedTime);
                      }
                    }}
                  >
                    {String(second).padStart(2, "0")}
                  </Button>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
