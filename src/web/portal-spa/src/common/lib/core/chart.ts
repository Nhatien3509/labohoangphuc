import "chartjs-adapter-date-fns";
import {
  BarElement,
  CategoryScale,
  type Chart,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  type Plugin,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";
import { cn } from "@common/lib/core/utils";

export const registerCharts = () => {
  ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    CustomChartPoint,
  );
};

export const CHART_COLORS = [
  "--orange-800",
  "--green-800",
  "--red-800",
  "--blue-800",
  "--teal-500",
  "--red-400",
  "--cyan-400",
  "--orange-400",
];

export const LEGEND_CONTAINER = "legend-container";

export type LegendLayout = "default" | "custom-legend";

type LegendPluginOptions = {
  containerID?: string;
  layout?: LegendLayout;
};

type LegendLayoutConfig = {
  itemClassName?: string;
  itemStyle?: Partial<Pick<CSSStyleDeclaration, "flex" | "maxWidth">>;
  buttonClassName?: string;
  textClassName?: string;
  textMaxWidth: string;
  shouldRenderSeparator?: (index: number, totalItems: number) => boolean;
  getOrCreateLegendList: (id: string) => HTMLDivElement | null;
};

type LegendListElements = {
  listContainer: HTMLDivElement;
  innerDiv: HTMLDivElement;
};

type LegendListLayoutConfig = {
  listContainerClassName: string;
  innerContainerClassName: string;
  scrollbarWidth?: CSSStyleDeclaration["scrollbarWidth"];
};

const getOrCreateLegendListElements = (
  id: string,
): LegendListElements | null => {
  const legendContainer = document.getElementById(id);
  if (!legendContainer) return null;

  let listContainer = legendContainer.querySelector("div");
  let innerDiv = listContainer?.querySelector("div") as HTMLDivElement | null;

  if (!listContainer) {
    listContainer = document.createElement("div");
    innerDiv = document.createElement("div");
    listContainer.appendChild(innerDiv);
    legendContainer.appendChild(listContainer);
  }

  if (!innerDiv) {
    innerDiv = document.createElement("div");
    listContainer.appendChild(innerDiv);
  }

  return {
    listContainer,
    innerDiv,
  };
};

const applyLegendListLayout = (id: string, config: LegendListLayoutConfig) => {
  const legendListElements = getOrCreateLegendListElements(id);
  if (!legendListElements) return null;

  const { listContainer, innerDiv } = legendListElements;

  listContainer.className = config.listContainerClassName;
  listContainer.style.scrollbarWidth = config.scrollbarWidth ?? "thin";
  innerDiv.className = config.innerContainerClassName;

  return innerDiv;
};

const LEGEND_LAYOUT_CONFIG: Record<LegendLayout, LegendLayoutConfig> = {
  default: {
    textMaxWidth: "calc(100vw - 6.25rem)",
    getOrCreateLegendList: (id) =>
      applyLegendListLayout(id, {
        listContainerClassName:
          "mt-4 max-h-[6.5rem] overflow-x-hidden overflow-y-auto pt-2",
        innerContainerClassName: "space-y-1",
      }),
  },
  "custom-legend": {
    itemClassName: "relative shrink-0",
    itemStyle: {
      flex: "0 0 50%",
      maxWidth: "50%",
    },
    buttonClassName: "w-full",
    textClassName: "flex-1 text-left",
    textMaxWidth: "100%",
    shouldRenderSeparator: (index, totalItems) => index < totalItems - 1,
    getOrCreateLegendList: (id) =>
      applyLegendListLayout(id, {
        listContainerClassName: "mt-4 overflow-x-auto overflow-y-hidden pb-2",
        innerContainerClassName: "flex items-center",
      }),
  },
};

const getLegendLayoutConfig = (
  layout: LegendLayout = "default",
): LegendLayoutConfig => LEGEND_LAYOUT_CONFIG[layout];

const createLegendSeparator = () => {
  const separator = document.createElement("div");
  separator.className =
    "pointer-events-none mx-2 h-5 w-px shrink-0 bg-neutral-100";

  return separator;
};

const getLegendPluginOptions = (chart: Chart): LegendPluginOptions => {
  const plugins = chart.options.plugins as
    | (Record<string, unknown> & {
        htmlLegend?: LegendPluginOptions;
      })
    | undefined;

  return plugins?.htmlLegend ?? {};
};

export const getLegendContainerId = (chart: Chart): string => {
  const plugins = chart.options.plugins as
    | (Record<string, unknown> & {
        htmlLegend?: LegendPluginOptions;
        chartMouseLeave?: LegendPluginOptions;
      })
    | undefined;

  return (
    plugins?.htmlLegend?.containerID ??
    plugins?.chartMouseLeave?.containerID ??
    LEGEND_CONTAINER
  );
};

export const getCSSVariableValue = (variableName: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(variableName);

const HOVER_BORDER_WIDTH = 3;

export const hoverLinePlugin: Plugin<"line"> = {
  id: "hoverLine",
  afterDatasetsDraw(chart) {
    const activeElements = chart.getActiveElements();
    if (activeElements.length === 0) return;

    const activeDatasetIndex = activeElements[0]?.datasetIndex;
    if (activeDatasetIndex === undefined) return;

    const meta = chart.getDatasetMeta(activeDatasetIndex);
    if (meta.hidden) return;

    const dataset = chart.data.datasets[activeDatasetIndex];
    if (!dataset) return;

    const ctx = chart.ctx;
    const points = meta.data;
    const chartArea = chart.chartArea;

    ctx.save();

    // Clip to chart area to prevent drawing outside
    ctx.beginPath();
    ctx.rect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
    ctx.clip();

    ctx.beginPath();
    ctx.lineWidth = HOVER_BORDER_WIDTH;
    ctx.strokeStyle = dataset.borderColor as string;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    let started = false;
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point) continue;

      const { x, y } = point.getProps(["x", "y"], true) as {
        x: number;
        y: number;
      };
      const value = dataset.data[i];

      // Skip NaN values (gaps in data)
      if (typeof value !== "number" || isNaN(value)) {
        started = false;
        continue;
      }

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.restore();
  },
};

export const CustomChartPoint = {
  id: "CustomChartPoint",
  afterDatasetsDraw(chart: Chart) {
    const ctx = chart.ctx;
    const activeElements = chart.tooltip?.getActiveElements() ?? [];

    if (activeElements.length === 0) return;

    ctx.save();

    activeElements.forEach((active) => {
      const { datasetIndex, index: dataIndex } = active;
      const dataset = chart.data.datasets[datasetIndex];
      const meta = chart.getDatasetMeta(datasetIndex);
      const point = meta.data[dataIndex];
      if (!point) return;

      const { x, y } = point.getProps(["x", "y"], true);
      const xNum = Number(x);
      const yNum = Number(y);

      const pointColor = dataset?.borderColor as string;

      ctx.beginPath();
      ctx.arc(xNum, yNum, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = pointColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(xNum, yNum, 4 * 0.65, 0, 2 * Math.PI);
      ctx.fillStyle = getCSSVariableValue("--neutral-0");
      ctx.fill();

      ctx.beginPath();
      ctx.arc(xNum, yNum, 4 * 0.35, 0, 2 * Math.PI);
      ctx.fillStyle = pointColor;
      ctx.strokeStyle = getCSSVariableValue("--neutral-900");
      ctx.lineWidth = 0.25;
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  },
};

export const LEGEND_TOOLTIP_ID = "legend-tooltip";

export function getOrCreateLegendTooltip(): HTMLDivElement {
  const existing = document.getElementById(
    LEGEND_TOOLTIP_ID,
  ) as HTMLDivElement | null;
  if (existing) {
    return existing;
  }
  const tooltip = document.createElement("div");
  tooltip.id = LEGEND_TOOLTIP_ID;
  tooltip.className =
    "fixed z-50 max-w-3xl rounded bg-neutral-800 px-3 py-2 text-sm text-white shadow-lg pointer-events-none opacity-0 transition-opacity duration-150 break-all";
  document.body.appendChild(tooltip);
  return tooltip;
}

export function showLegendTooltip(text: string, x: number, bottom: number) {
  const tooltip = getOrCreateLegendTooltip();
  tooltip.textContent = text;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${bottom + 8}px`;
  tooltip.style.transform = "translateY(0)";
  tooltip.style.opacity = "1";
}

export function hideLegendTooltip() {
  const tooltip = document.getElementById(LEGEND_TOOLTIP_ID);
  if (tooltip) {
    tooltip.style.opacity = "0";
  }
}

export const chartMouseLeavePlugin: Plugin<"line"> = {
  id: "chartMouseLeave",
  afterEvent(chart, args) {
    if (args.event.type === "mouseout") {
      updateLegendHoverState(null, getLegendContainerId(chart));
    }
  },
};

export const htmlLegendPlugin: Plugin<"line"> = {
  id: "htmlLegend",
  afterUpdate(chart) {
    const legendOptions = getLegendPluginOptions(chart);
    const layoutConfig = getLegendLayoutConfig(legendOptions.layout);
    const ul = getOrCreateLegendList(
      getLegendContainerId(chart),
      legendOptions.layout,
    );

    while (ul?.firstChild) {
      ul.firstChild.remove();
    }

    const items =
      chart.options.plugins?.legend?.labels?.generateLabels?.(chart) ?? [];

    items.forEach((item, index) => {
      const li = document.createElement("div");
      li.className = cn(
        "flex min-w-0 items-center gap-2 transition-opacity duration-150",
        layoutConfig.itemClassName,
      );
      li.setAttribute("data-dataset-index", String(item.datasetIndex ?? 0));
      if (layoutConfig.itemStyle) {
        Object.assign(li.style, layoutConfig.itemStyle);
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = cn(
        "flex min-w-0 max-w-full items-center gap-2 hover:opacity-80",
        layoutConfig.buttonClassName,
      );
      button.onclick = () => {
        toggleDatasetVisibility(chart, item.datasetIndex ?? 0);
        chart.update();
      };

      const boxSpan = document.createElement("span");
      boxSpan.className = "h-0.5 w-4 shrink-0";
      boxSpan.style.backgroundColor = item.fillStyle as string;

      const textSpan = document.createElement("span");
      const fullText = item.text;

      textSpan.className = cn(
        "block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm transition-all duration-150",
        layoutConfig.textClassName,
        {
          "text-neutral-400 line-through": !!item.hidden,
        },
      );
      textSpan.style.maxWidth = layoutConfig.textMaxWidth;
      textSpan.textContent = fullText;

      li.onmouseenter = () => {
        const rect = li.getBoundingClientRect();
        showLegendTooltip(fullText, rect.left, rect.bottom);
      };
      li.onmouseleave = () => {
        hideLegendTooltip();
      };

      button.appendChild(boxSpan);
      button.appendChild(textSpan);
      li.appendChild(button);

      if (layoutConfig.shouldRenderSeparator?.(index, items.length)) {
        li.appendChild(createLegendSeparator());
      }

      ul?.appendChild(li);
    });
  },
};

export function getOrCreateLegendList(
  id: string,
  layout: LegendLayout = "default",
) {
  const layoutConfig = getLegendLayoutConfig(layout);

  return layoutConfig.getOrCreateLegendList(id);
}

export const toggleDatasetVisibility = (chart: Chart, clickedIndex: number) => {
  const totalDatasets = chart.data.datasets.length;

  const onlyThisVisible = Array.from({ length: totalDatasets }, (_, i) => i)
    .filter((i) => i !== clickedIndex)
    .every((i) => !chart.isDatasetVisible(i));

  if (onlyThisVisible) {
    for (let i = 0; i < totalDatasets; i++) {
      chart.setDatasetVisibility(i, true);
    }
  } else {
    for (let i = 0; i < totalDatasets; i++) {
      chart.setDatasetVisibility(i, i === clickedIndex);
    }
  }

  chart.update();
};

export const updateLegendHoverState = (
  activeDatasetIndex: number | null,
  containerId = LEGEND_CONTAINER,
) => {
  const legendContainer = document.getElementById(containerId);
  if (!legendContainer) return;

  const legendItems = legendContainer.querySelectorAll("[data-dataset-index]");

  legendItems.forEach((item) => {
    const element = item as HTMLElement;
    const datasetIndex = parseInt(
      element.getAttribute("data-dataset-index") ?? "-1",
      10,
    );

    if (activeDatasetIndex === null) {
      // Reset all legends to normal state
      element.style.opacity = "1";
      element.style.fontWeight = "normal";
    } else if (datasetIndex === activeDatasetIndex) {
      // Highlight active legend
      element.style.opacity = "1";
      element.style.fontWeight = "600";
    } else {
      // Dim other legends
      element.style.opacity = "0.4";
      element.style.fontWeight = "normal";
    }
  });
};
