import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type DayOfWeekValue =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const useDayOfWeek = <T extends DayOfWeekValue>(
  dayOfWeekEnum: Record<string, T>,
) => {
  const t = useLayoutStore((state) => state.t);

  const labelMap: Record<DayOfWeekValue, string> = {
    monday: t("common.days_of_the_week.monday"),
    tuesday: t("common.days_of_the_week.tuesday"),
    wednesday: t("common.days_of_the_week.wednesday"),
    thursday: t("common.days_of_the_week.thursday"),
    friday: t("common.days_of_the_week.friday"),
    saturday: t("common.days_of_the_week.saturday"),
    sunday: t("common.days_of_the_week.sunday"),
  };

  const dayOfWeekOptions = Object.values(dayOfWeekEnum).map((value) => ({
    value,
    label: labelMap[value],
  }));

  return dayOfWeekOptions;
};
