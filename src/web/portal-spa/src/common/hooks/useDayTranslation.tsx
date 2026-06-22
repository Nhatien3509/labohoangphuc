import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

// Inlined from deleted @dbaas/_apis/types
type AutoBackupConfigDayOfWeekEnum =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

function useDayTranslation() {
  const { t } = useLayoutStore((state) => state);

  const dayMap: Record<AutoBackupConfigDayOfWeekEnum, string> = {
    monday: t("common.days_of_the_week.monday"),
    tuesday: t("common.days_of_the_week.tuesday"),
    wednesday: t("common.days_of_the_week.wednesday"),
    thursday: t("common.days_of_the_week.thursday"),
    friday: t("common.days_of_the_week.friday"),
    saturday: t("common.days_of_the_week.saturday"),
    sunday: t("common.days_of_the_week.sunday"),
  };

  return dayMap;
}

export default useDayTranslation;
