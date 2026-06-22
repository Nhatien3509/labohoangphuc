import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@common/components/ui/radio-group";
import { Button } from "@common/components/ui/button";
import { DatePicker } from "@common/components/containers/datetime/DatePicker";
import { Label } from "@common/components/ui/label";
import type { OptionType } from "@common/lib/core/types";
import Select from "@common/components/containers/selects/SelectContainer";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import {
  CaretDown,
  Check,
  DragVerticalVariant,
  X,
} from "@common/components/icons";

import { type ContainerProps, components } from "react-select";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  format,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subWeeks,
} from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { type DateRange } from "react-day-picker";
import type { FetchResult } from "@/api/types";
import { type MetricChoices } from "@common/components/cards/monitoring/ChartsCard";
import type { Metrics } from "@/api/common/types";
import { useActionAPI } from "@common/hooks/useActionAPI";
import { useTranslations } from "next-intl";

export const VIEW_MODE = {
  listView: "listView",
  gridView: "gridView",
};

export interface TimeInterval {
  from: Date;
  to: Date;
}

type MonitoringTabSettingsProps = {
  translatePath?: string;
  metricChoicesList: { id: string; value: string; displayName: string }[];
  toggleCharts: boolean[];
  viewMode: string;
  handleViewModeChange: React.Dispatch<React.SetStateAction<string>>;
  handleChartsToggle: (activates: boolean[]) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleMetricChoicesList: (metrics: MetricChoices[]) => void;
  handleMetricsMap: React.Dispatch<
    React.SetStateAction<Map<string, Metrics[]>>
  >;
  getMetricsSchemaFn: () => Promise<
    FetchResult<{
      metric: { choices: { value: string; displayName: string }[] };
    }>
  >;
  getMetricsInfoFn: (query: {
    metric: string;
    start?: string;
    end?: string;
  }) => Promise<FetchResult<Metrics[]>>;
};

export default function MonitoringTabSettings({
  translatePath,
  metricChoicesList,
  toggleCharts,
  viewMode,
  handleViewModeChange,
  handleChartsToggle,
  handleDragEnd,
  handleMetricChoicesList,
  handleMetricsMap,
  getMetricsSchemaFn,
  getMetricsInfoFn,
}: Readonly<MonitoringTabSettingsProps>) {
  const t = useTranslations(translatePath);

  const OFF: OptionType = {
    label: t("settings.off"),
    value: "off",
  };
  const FIVE_MINS: OptionType = {
    label: t("settings.x_mins", { count: 5 }),
    value: "5Mins",
  };
  const TEN_MINS: OptionType = {
    label: t("settings.x_mins", { count: 10 }),
    value: "10Mins",
  };
  const FIFTEEN_MINS: OptionType = {
    label: t("settings.x_mins", { count: 15 }),
    value: "15Mins",
  };

  const REFRESH_RATES: OptionType[] = [OFF, FIVE_MINS, TEN_MINS, FIFTEEN_MINS];

  const SELECT_PERIOD: OptionType = {
    label: t("settings.select"),
    value: "selectPeriod",
  };
  const LAST_30MINS: OptionType = {
    label: t("settings.last_30_mins"),
    value: "last30mins",
  };
  const LAST_HOUR: OptionType = {
    label: t("settings.last_x_hours", { count: 1 }),
    value: "lastHour",
  };
  const LAST_3HOURS: OptionType = {
    label: t("settings.last_x_hours", { count: 3 }),
    value: "last3Hours",
  };
  const LAST_12HOURS: OptionType = {
    label: t("settings.last_x_hours", { count: 12 }),
    value: "last12Hours",
  };
  const LAST_DAY: OptionType = {
    label: t("settings.last_x_days", { count: 1 }),
    value: "lastDay",
  };
  const LAST_3DAYS: OptionType = {
    label: t("settings.last_x_days", { count: 3 }),
    value: "last3Days",
  };
  const LAST_WEEK: OptionType = {
    label: t("settings.last_x_weeks", { count: 1 }),
    value: "lastWeek",
  };
  const LAST_MONTH: OptionType = {
    label: t("settings.last_x_months", { count: 1 }),
    value: "lastMonth",
  };
  const LAST_3MONTHS: OptionType = {
    label: t("settings.last_x_months", { count: 3 }),
    value: "last3Months",
  };

  const MONITORING_PERIODS: OptionType[] = [
    SELECT_PERIOD,
    LAST_30MINS,
    LAST_HOUR,
    LAST_3HOURS,
    LAST_12HOURS,
    LAST_DAY,
    LAST_3DAYS,
    LAST_WEEK,
    LAST_MONTH,
    LAST_3MONTHS,
  ];

  const { executeAction } = useActionAPI();

  const [monitoringPeriod, setMonitoringPeriod] = useState<TimeInterval>({
    from: subMinutes(new Date(), 30),
    to: new Date(),
  });
  const monitoringPeriodRef = useRef<TimeInterval>({
    from: subMinutes(new Date(), 30),
    to: new Date(),
  });
  const [isMonitoringPeriodOpen, setIsMonitoringPeriodOpen] = useState(false);
  const [monitoringDatePicker, setMonitoringDatePicker] = useState<DateRange>({
    from: subMinutes(new Date(), 30),
    to: new Date(),
  });

  const [selectedMonitoringPeriod, setSelectedMonitoringPeriod] =
    useState<OptionType>(LAST_30MINS);
  const selectedMonitoringPeriodRef = useRef<OptionType>(LAST_30MINS);

  const [timezone, setTimezone] = useState<number>(7);
  const timezoneRef = useRef<number>(7);

  const [refreshInterval, setRefreshInterval] = useState<OptionType>(OFF);

  const [monitoringPeriodOptions, setMonitoringPeriodOptions] =
    useState<OptionType[]>(MONITORING_PERIODS);

  const fetchAllMetrics = () => {
    metricChoicesList.forEach((metrics) => {
      void getMetrics(metrics.value);
    });
  };

  const getMetricsSchema = async () => {
    const resMetricsSchema = await executeAction(getMetricsSchemaFn);
    if (!resMetricsSchema?.success) return;

    if (resMetricsSchema.data?.metric.choices) {
      const metricChoiceOptions = resMetricsSchema.data.metric.choices.map(
        (metric) => ({
          id: metric.value,
          value: metric.value,
          displayName: metric.displayName,
        }),
      );
      const initialSchemas = new Array(metricChoiceOptions.length).fill(
        true,
      ) as boolean[];
      handleChartsToggle(initialSchemas);
      handleMetricChoicesList(metricChoiceOptions);
    }
  };

  const getMetrics = async (metric: string) => {
    let fromTime: string;
    let toTime: string;
    if (selectedMonitoringPeriodRef.current.value === SELECT_PERIOD.value) {
      fromTime = formatDate(monitoringPeriodRef.current.from);
      toTime = formatDate(monitoringPeriodRef.current.to);
    } else {
      fromTime = formatDate(
        getNewStartTime(selectedMonitoringPeriodRef.current.value, new Date()),
      );
      toTime = formatDate(new Date());
    }

    const resMetrics = await executeAction(getMetricsInfoFn, {
      metric,
      start: fromTime,
      end: toTime,
    });

    if (!resMetrics?.success || !resMetrics.data) return;

    const metrics = resMetrics.data.map((item) => ({
      ...item,
      data: item.data.map(
        (value) =>
          [value[0] + (timezone - 7) * 60 * 60, value[1]] as [number, string],
      ),
    }));

    handleMetricsMap((prev) => {
      const updated = new Map(prev);
      updated.set(metric, metrics);
      return updated;
    });
  };

  const handleMonitoringDatePicker = (date: DateRange) => {
    setMonitoringDatePicker(date);
    const displayValue =
      date.from && date.to
        ? format(date.from, "dd/MM/yyyy HH:mm:ss") +
          " - " +
          format(date.to, "dd/MM/yyyy HH:mm:ss")
        : null;

    if (displayValue != null) {
      const updatedOptions = [...monitoringPeriodOptions];
      const monitoringPeriodOption: OptionType = {
        label: displayValue,
        value: SELECT_PERIOD.value,
      };
      setMonitoringPeriodOptions(updatedOptions);
      setSelectedMonitoringPeriod(monitoringPeriodOption);
      selectedMonitoringPeriodRef.current = monitoringPeriodOption;
      if (date.from && date.to) {
        setMonitoringPeriod({ from: date.from, to: date.to });
        monitoringPeriodRef.current = { from: date.from, to: date.to };
      }
    }
  };

  const getNewStartTime = (option: string, startTime: Date) => {
    let newStartTime = startTime;
    switch (option) {
      case SELECT_PERIOD.value:
        return newStartTime;
      case LAST_30MINS.value:
        newStartTime = subHours(new Date(), 0.5);
        break;
      case LAST_HOUR.value:
        newStartTime = subHours(new Date(), 1);
        break;
      case LAST_3HOURS.value:
        newStartTime = subHours(new Date(), 3);
        break;
      case LAST_12HOURS.value:
        newStartTime = subHours(new Date(), 12);
        break;
      case LAST_DAY.value:
        newStartTime = subDays(new Date(), 1);
        break;
      case LAST_3DAYS.value:
        newStartTime = subDays(new Date(), 3);
        break;
      case LAST_WEEK.value:
        newStartTime = subWeeks(new Date(), 1);
        break;
      case LAST_MONTH.value:
        newStartTime = subMonths(new Date(), 1);
        break;
      case LAST_3MONTHS.value:
        newStartTime = subMonths(new Date(), 3);
        break;
      default:
        break;
    }
    return newStartTime;
  };

  const handlePeriodOptionChange = (opt: OptionType) => {
    const newStartTime = getNewStartTime(opt.value, monitoringPeriod.from);
    if (opt.value === SELECT_PERIOD.value) {
      setIsMonitoringPeriodOpen(true);
      return;
    }
    const newTo = new Date();
    setMonitoringDatePicker({ from: newStartTime, to: newTo });
    setMonitoringPeriod({ from: newStartTime, to: newTo });
    monitoringPeriodRef.current = { from: newStartTime, to: newTo };
    setSelectedMonitoringPeriod(opt);
    selectedMonitoringPeriodRef.current = opt;
  };

  const handleTabClick = (index: number) => {
    if (toggleCharts.length > 0) {
      const newToggleCharts = [...toggleCharts];
      newToggleCharts[index] = !newToggleCharts[index];
      handleChartsToggle(newToggleCharts);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    }),
  );

  const getRefreshRate = (rate: OptionType): number => {
    const timeMapping: Record<string, number> = {
      off: 0,
      "5Mins": 300000,
      "10Mins": 600000,
      "15Mins": 1800000,
    };
    return timeMapping[rate.value] ?? 0;
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchAllMetrics, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [metricChoicesList, monitoringPeriod.from, timezone]);

  useEffect(() => {
    if (selectedMonitoringPeriod.value === SELECT_PERIOD.value) return;

    let intervalId: NodeJS.Timeout | undefined;
    const duration = getRefreshRate(refreshInterval);
    if (duration > 0) {
      intervalId = setInterval(fetchAllMetrics, duration);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshInterval.value, selectedMonitoringPeriod]);

  useEffect(() => {
    void getMetricsSchema();
  }, []);

  const lastThreeMonths = new Date();
  lastThreeMonths.setMonth(new Date().getMonth() - 3);
  lastThreeMonths.setSeconds(0);
  lastThreeMonths.setMilliseconds(0);

  const SelectContainer = useCallback(
    ({ children, ...props }: ContainerProps) => {
      return selectedMonitoringPeriod.value ===
        monitoringPeriodOptions[0]?.value && !props.isFocused ? (
        <TooltipContainer
          isPreventDefault={false}
          content={selectedMonitoringPeriod.label}
        >
          <span className="block">
            <components.SelectContainer {...props}>
              {children}
            </components.SelectContainer>
          </span>
        </TooltipContainer>
      ) : (
        <components.SelectContainer {...props}>
          {children}
        </components.SelectContainer>
      );
    },
    [selectedMonitoringPeriod],
  );

  return (
    <DropdownMenu
      onOpenChange={(open: boolean) => {
        if (!open) setIsMonitoringPeriodOpen(false);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          rightIcon={<CaretDown />}
          variant="ghost"
          className="aria-expanded:bg-neutral-200 aria-expanded:shadow-I-X2-Y2-B4-S0-25"
        >
          {t("settings.title")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        forceMount
        align="end"
        className="scrollbar max-h-[60vh] w-[15.25rem] overflow-y-auto rounded border-neutral-0 px-0 pb-4 pt-6 !shadow-D-X0-Y0-B10-S0-30"
        side="bottom"
      >
        <DropdownMenuGroup className="flex flex-col gap-4 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-base font-bold">{t("settings.view_mode")}</div>
          </div>
          <RadioGroup value={viewMode} onValueChange={handleViewModeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                id={VIEW_MODE.listView}
                value={VIEW_MODE.listView}
              />
              <Label htmlFor={VIEW_MODE.listView}>
                {t("settings.list_view")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                id={VIEW_MODE.gridView}
                value={VIEW_MODE.gridView}
              />
              <Label htmlFor={VIEW_MODE.gridView}>
                {t("settings.grid_view")}
              </Label>
            </div>
          </RadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-dark-100" />

        <DropdownMenuGroup className="flex flex-col gap-3 px-6 py-3">
          <div className="text-base font-bold">{t("settings.time")}</div>
          <div className="space-y-1">
            <div className="text-base">{t("settings.monitoring_period")}</div>
            <Select
              id="time-period-options"
              options={monitoringPeriodOptions}
              value={selectedMonitoringPeriod}
              onChange={(val) => {
                handlePeriodOptionChange(val as OptionType);
              }}
              components={{ SelectContainer }}
            />
            <DatePicker
              isShowLastMonth
              allowSeconds
              enableManualOpen={isMonitoringPeriodOpen}
              toggleDatePicker={false}
              defaultSelectedDate={monitoringDatePicker}
              showClear={false}
              triggerQuickSelect={false}
              applyBtn={{
                leftIcon: <Check />,
                handleApply: () => {
                  setIsMonitoringPeriodOpen(false);
                },
              }}
              calendarClassName={{
                nav: "flex w-[92%] absolute justify-between space-x-1",
              }}
              cancelBtn={{
                leftIcon: <X />,
                handleCancel: () => {
                  setIsMonitoringPeriodOpen(false);
                },
              }}
              onChangeSelectedDate={(date) => {
                handleMonitoringDatePicker(date);
              }}
              onOpen={setIsMonitoringPeriodOpen}
              allowedStartDate={lastThreeMonths}
              allowedEndDate={new Date()}
            />
          </div>
          <div className="space-y-1">
            <div className="text-base">{t("settings.refresh_rate")}</div>
            <Select
              defaultValue={refreshInterval}
              id="time-refresh-options"
              options={REFRESH_RATES}
              onChange={(val) => {
                setRefreshInterval(val as OptionType);
              }}
            />
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-2 bg-neutral-100 dark:bg-neutral-dark-100" />

        <DropdownMenuGroup className="flex flex-col gap-3 px-6 py-3">
          <div className="flex items-center justify-between space-y-0">
            <div className="text-base font-bold">{t("settings.time_zone")}</div>
          </div>
          <RadioGroup
            defaultValue={timezone.toString()}
            onValueChange={(time: string) => {
              setTimezone(Number(time));
              timezoneRef.current = Number(time);
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="timezone-7" value="7" />
                <Label htmlFor="timezone-7">{"UTC +7"}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="timezone-0" value="0" />
                <Label htmlFor="timezone-0">{"UTC +0"}</Label>
              </div>
            </div>
          </RadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-dark-100" />

        <DropdownMenuGroup className="flex flex-col gap-4 py-3">
          <div className="px-6">
            <div className="text-base font-bold">{t("settings.metrics")}</div>
            <div className="text-base italic">
              {t("settings.drag_and_drop")}
            </div>
          </div>
          <div className="px-2.5">
            <DndContext
              collisionDetection={closestCorners}
              sensors={sensors}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={metricChoicesList}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col space-y-1">
                  {metricChoicesList.map((metrics, index) => (
                    <SortableItem key={metrics.value} id={metrics.value}>
                      <Button
                        variant={"text"}
                        className={`relative h-fit w-full rounded-none py-2 pl-0 text-left text-neutral-800 hover:text-neutral-800 focus:shadow-none active:shadow-none ${
                          toggleCharts[index]
                            ? "font-bold"
                            : "font-normal hover:font-bold"
                        }`}
                        onClick={() => {
                          handleTabClick(index);
                        }}
                      >
                        <span className="absolute left-0 flex items-center">
                          <DragVerticalVariant className="text-neutral-100 hover:text-primary-200 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15" />
                        </span>
                        <span className="w-full whitespace-break-spaces pl-8 text-left">
                          {metrics.displayName}
                        </span>
                        {toggleCharts[index] && (
                          <span className="shrink-0 text-primary-100">
                            <Check />
                          </span>
                        )}
                      </Button>
                    </SortableItem>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const formatDate = (date: Date): string => {
  const adjustedDate = subHours(date, 7);
  return format(adjustedDate, "yyyy-MM-dd HH:mm:ss");
};

interface SortableItemProps {
  children: React.ReactNode;
  id: string | number;
}

function SortableItem({ children, id }: Readonly<SortableItemProps>) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex cursor-pointer items-center justify-between border border-neutral-100 py-2 pl-1 pr-3 hover:bg-gray-100`}
    >
      {children}
    </li>
  );
}
