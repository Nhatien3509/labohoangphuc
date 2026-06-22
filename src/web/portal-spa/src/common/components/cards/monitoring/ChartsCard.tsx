import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@common/components/ui/card";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import { VIEW_MODE } from "@common/components/cards/monitoring/MonitoringTabSettings";

import { type ChartData, type ChartOptions, type TooltipItem } from "chart.js";
import React, { useEffect, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { Line } from "react-chartjs-2";
import type { Metrics } from "@/api/common/types";
import { cn } from "@common/lib/core/utils";
import { format } from "date-fns";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useSortable } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";

export interface MetricChoices {
  id: string;
  value: string;
  displayName: string;
}

type ChartsCardProps = Partial<{
  translatePath: string;
  buttons: React.JSX.Element[];
  metricChoices: MetricChoices;
  metrics: Metrics[];
  isFullscreen: boolean;
  fullscreenViewMode: string;
}>;

export default function ChartsCard({
  translatePath,
  buttons,
  metricChoices,
  metrics,
  isFullscreen,
  fullscreenViewMode,
}: Readonly<ChartsCardProps>) {
  const t = useTranslations(translatePath);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: metricChoices?.id ?? "" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "auto",
  };

  const [data, setData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  });

  const unitInfo = getUnitInfo(metricChoices?.value);
  const options = getChartOptions(unitInfo);

  useEffect(() => {
    if (!metrics) return;

    const unitInfo = getUnitInfo(metricChoices?.value);
    const newData = getChartData(metricChoices?.value, metrics, unitInfo);
    setData(newData);
  }, [metricChoices?.value, metrics, unitInfo.cal]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="h-full w-full"
    >
      <Card
        className={cn(
          "h-[inherit]",
          getCardClassName(isFullscreen, fullscreenViewMode),
        )}
      >
        <CardHeader
          className={`space-y-0 ${isFullscreen && fullscreenViewMode == VIEW_MODE.listView ? "pt-0" : ""}`}
        >
          <div className="flex justify-between justify-items-center">
            <CardTitle className="flex items-center text-md font-bold">
              {metricChoices?.displayName}
            </CardTitle>
            <div className="flex items-center space-x-3">
              {buttons?.map((button) => (
                <div key={button.key}>
                  {button.key === "movement" ? (
                    <TooltipContainer
                      content={t("drag")}
                      isPreventDefault={false}
                      align="end"
                    >
                      {React.cloneElement(button, {
                        ...listeners,
                      })}
                    </TooltipContainer>
                  ) : (
                    button
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="border-b border-neutral-100 pt-2"></div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "relative mx-auto w-full pb-0",
              getHeightClass(isFullscreen, fullscreenViewMode),
            )}
          >
            {data.labels && data.labels.length > 0 ? (
              <Line data={data} options={options} />
            ) : (
              <NoData />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NoData() {
  const t = useLayoutStore((state) => state.t);
  return (
    <div className="absolute inset-0 flex h-full items-center justify-center">
      <p className="text-base">{t("common.no_data")}</p>
    </div>
  );
}

const getCardClassName = (
  isFullscreen?: boolean,
  fullscreenViewMode?: string,
) => {
  if (!isFullscreen) return "shadow-none border border-neutral-200";
  if (fullscreenViewMode == VIEW_MODE.listView) return "shadow-none";
  return "";
};

const getHeightClass = (
  isFullscreen?: boolean,
  fullscreenViewMode?: string,
) => {
  if (!isFullscreen) return "h-[16rem]";
  if (fullscreenViewMode === VIEW_MODE.listView) return "h-[calc(100vh-10rem)]";
  if (fullscreenViewMode === VIEW_MODE.gridView) return "h-[20rem]";

  return "h-[16rem]";
};

const getCSSVariableValue = (variableName: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(
    variableName,
  );
};

const getUnitInfo = (metricValue: string | undefined) => {
  return chartUnits.get(metricValue ?? "") ?? { unit: "", cal: 1 };
};

const getChartData = (
  metricValue: string | undefined,
  metricsData: Metrics[],
  unitInfo: { unit: string; cal?: number },
) => {
  const labels: number[] = [];
  const dataInDatasets: number[] = [];

  metricsData[0]?.data.forEach(([id, value]) => {
    labels.push(id ? id * 1000 : 0);
    const processedValue = value ? Number(value) / (unitInfo.cal ?? 1) : 0;
    dataInDatasets.push(processedValue);
  });

  return {
    labels,
    datasets: [
      {
        label: metricValue,
        data: dataInDatasets,
        borderColor: getCSSVariableValue("--primary-100"),
        backgroundColor: getCSSVariableValue("--primary-100"),
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };
};

const getChartOptions = (unitInfo: { unit: string; cal?: number }) => {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        align: "start",
        labels: {
          boxHeight: 2,
        },
      },
      tooltip: {
        callbacks: {
          title: function (items: TooltipItem<"line">[]) {
            return items.length > 0 && items[0]?.parsed.x
              ? format(new Date(items[0].parsed.x), "HH:mm:ss - dd/MM/yyyy")
              : "";
          },
          label: function (items: TooltipItem<"line">) {
            return items.dataset.label;
          },
          footer: function (items: TooltipItem<"line">[]) {
            const unit = unitInfo.unit || "";
            const formattedValue = items[0]?.formattedValue ?? "";
            return formattedValue ? formattedValue + unit : "";
          },
        },
        backgroundColor: getCSSVariableValue("--neutral-0"),
        titleColor: getCSSVariableValue("--neutral-700"),
        bodyColor: getCSSVariableValue("--primary-100"),
        footerColor: getCSSVariableValue("--neutral-700"),
        borderColor: getCSSVariableValue("--neutral-100"),
        borderWidth: 1,
        position: "nearest",
        xAlign: "left",
        yAlign: "center",
        caretSize: 0,
        caretPadding: 20,
        padding: {
          top: 8,
          right: 8,
          bottom: 8,
          left: 12,
        },
        cornerRadius: 4,
        bodySpacing: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          tooltipFormat: "PP",
          displayFormats: {
            second: "HH:mm:ss",
            minute: "HH:mm",
            hour: "HH:mm dd",
            day: "dd.MM",
            week: "dd.MM",
            month: "MM.yyyy",
            quarter: "MM.yyyy",
            year: "yyyy",
          },
        },
        title: {
          display: false,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        min: 0,
        title: {
          display: false,
        },
        ticks: {
          callback: function (value: string | number) {
            if (typeof value !== "number") return `${value} ${unitInfo.unit}`;
            let displayValue = Number.isInteger(value)
              ? value
              : (Math.ceil(value * 1000) / 1000).toFixed(3);
            displayValue = parseFloat(displayValue.toString()).toString();
            return `${displayValue} ${unitInfo.unit}`;
          },
        },
      },
    },
  };

  return options;
};

const chartUnits = new Map([
  ["cpu_usage_time_series", { unit: "%" }],
  ["memory_usage_time_series", { unit: "%" }],
  ["cpu_usage_timeseries", { unit: "%" }],
  ["memory_usage_timeseries", { unit: "%" }],
  ["read_disk_rate", { cal: 1048576, unit: "kB/s" }],
  ["write_disk_rate", { cal: 1048576, unit: "kB/s" }],
  ["disk_total", { cal: 1073741824, unit: "GiB" }],
  ["receive_bytes_rate", { unit: "kB/s" }],
  ["transmit_bytes_rate", { unit: "kB/s" }],
  ["transmit_packets_per_second", { unit: "kp/s" }],
  ["receive_packets_per_second", { unit: "kp/s" }],
  ["receive_error_packets", { unit: "kp/s" }],
  ["transmit_error_packets", { unit: "kp/s" }],
  ["iops_per_disk", { unit: "io/s" }],
  ["listener_http_requests", { unit: "" }],
  ["listener_http_responses", { unit: "" }],
  ["listener_request_errors", { unit: "" }],
  ["listener_throughput_in", { unit: "bytes/s" }],
  ["listener_throughput_out", { unit: "bytes/s" }],
  ["listener_active_servers", { unit: "" }],
  ["listener_response_time", { unit: "seconds" }],
  ["cpu_usage_avg", { unit: "%" }],
  ["memory_usage_avg", { unit: "%" }],
  ["lb_cpu_utilization_percent", { unit: "%" }],
  ["lb_memory_utilization_percent", { unit: "%" }],
  ["lb_requests", { unit: "" }],
  ["lb_request_errors", { unit: "" }],
  ["lb_throughput_in", { unit: "bytes/s" }],
  ["lb_throughput_out", { unit: "bytes/s" }],
  ["lb_active_servers", { unit: "" }],
  ["lb_response_time", { unit: "seconds" }],
]);
