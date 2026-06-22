import type { ActiveElement, Chart, ChartArea, Plugin } from "chart.js";
import {
  CHART_COLORS,
  LEGEND_CONTAINER,
  LEGEND_TOOLTIP_ID,
  getCSSVariableValue,
  getLegendContainerId,
  getOrCreateLegendList,
  getOrCreateLegendTooltip,
  hideLegendTooltip,
  hoverLinePlugin,
  htmlLegendPlugin,
  showLegendTooltip,
  toggleDatasetVisibility,
  updateLegendHoverState,
} from "@common/lib/core/chart";
import { beforeEach, describe, expect, it, vi } from "vitest";
/* ===============================
 * getCSSVariableValue
 * =============================== */

describe("getCSSVariableValue", () => {
  it("returns css variable value", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: (name: string) => `value-of-${name}`,
    } as CSSStyleDeclaration);

    const result = getCSSVariableValue("--neutral-0");

    expect(result).toBe("value-of---neutral-0");
  });
});

/* ===============================
 * toggleDatasetVisibility
 * =============================== */

describe("toggleDatasetVisibility", () => {
  it("shows only clicked dataset when multiple visible", () => {
    const chart = {
      data: {
        datasets: [{}, {}, {}],
      },
      isDatasetVisible: vi.fn(() => true),
      setDatasetVisibility: vi.fn(),
      update: vi.fn(),
    };

    toggleDatasetVisibility(chart as unknown as Chart, 1);

    expect(chart.setDatasetVisibility).toHaveBeenCalledWith(0, false);
    expect(chart.setDatasetVisibility).toHaveBeenCalledWith(1, true);
    expect(chart.setDatasetVisibility).toHaveBeenCalledWith(2, false);
    expect(chart.update).toHaveBeenCalled();
  });

  it("shows all datasets when only clicked one is visible", () => {
    const chart = {
      data: {
        datasets: [{}, {}, {}],
      },
      isDatasetVisible: vi.fn((i: number) => i === 1),
      setDatasetVisibility: vi.fn(),
      update: vi.fn(),
    };

    toggleDatasetVisibility(chart as unknown as Chart, 1);

    expect(chart.setDatasetVisibility).toHaveBeenCalledWith(0, true);
    expect(chart.setDatasetVisibility).toHaveBeenCalledWith(1, true);
    expect(chart.setDatasetVisibility).toHaveBeenCalledWith(2, true);
  });
});

describe("getOrCreateLegendList", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="legend-container"></div>`;
  });

  it("returns null when container does not exist", () => {
    const result = getOrCreateLegendList("does-not-exist");
    expect(result).toBeNull();
  });

  it("creates legend list if not exists (default layout)", () => {
    const list = getOrCreateLegendList("legend-container");

    expect(list).not.toBeNull();
    expect(list?.className).toContain("space-y-1");
  });

  it("applies default layout classes on outer container", () => {
    getOrCreateLegendList("legend-container", "default");

    const outer = document
      .getElementById("legend-container")
      ?.querySelector("div");
    expect(outer?.className).toContain("overflow-x-hidden");
    expect(outer?.className).toContain("overflow-y-auto");
  });

  it("applies custom-legend layout classes on inner div", () => {
    const list = getOrCreateLegendList("legend-container", "custom-legend");

    expect(list?.className).toContain("flex");
    expect(list?.className).toContain("items-center");
  });

  it("applies custom-legend layout classes on outer container", () => {
    getOrCreateLegendList("legend-container", "custom-legend");

    const outer = document
      .getElementById("legend-container")
      ?.querySelector("div");
    expect(outer?.className).toContain("overflow-x-auto");
    expect(outer?.className).toContain("overflow-y-hidden");
    expect(outer?.className).toContain("pb-2");
  });

  it("returns existing legend list if already created", () => {
    document.body.innerHTML = `
      <div id="legend-container"></div>
    `;

    const first = getOrCreateLegendList("legend-container");
    const second = getOrCreateLegendList("legend-container");

    expect(first).toBe(second);
  });
});

/* ------------------------------------------------------------------ */
/* Minimal types (chỉ đúng phần plugin dùng) */
/* ------------------------------------------------------------------ */

interface MockPoint {
  getProps(
    props: readonly ["x", "y"],
    final: boolean,
  ): { x: number; y: number };
}

interface MockDatasetMeta {
  hidden: boolean;
  data: MockPoint[];
}

interface MockDataset {
  data: (number | null)[];
  borderColor?: string;
}

interface MockCanvasContext {
  save: () => void;
  restore: () => void;
  beginPath: () => void;
  rect: (x: number, y: number, w: number, h: number) => void;
  clip: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  stroke: () => void;

  lineWidth: number;
  strokeStyle: string;
  lineJoin: CanvasLineJoin;
  lineCap: CanvasLineCap;
}

interface MockChart {
  getActiveElements(): ActiveElement[];
  getDatasetMeta(datasetIndex: number): MockDatasetMeta;
  data: {
    datasets: MockDataset[];
  };
  chartArea: ChartArea;
  ctx: MockCanvasContext;
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

const createMockCtx = (): MockCanvasContext => ({
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),

  lineWidth: 0,
  strokeStyle: "",
  lineJoin: "round",
  lineCap: "round",
});

const createPoint = (x: number, y: number): MockPoint => ({
  getProps: () => ({ x, y }),
});

const createChart = (overrides?: Partial<MockChart>): MockChart => ({
  getActiveElements: () => [],
  getDatasetMeta: () => ({
    hidden: false,
    data: [],
  }),
  data: {
    datasets: [],
  },
  chartArea: {
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 0,
    bottom: 0,
  },
  ctx: createMockCtx(),
  ...overrides,
});

/* ------------------------------------------------------------------ */
/* Tests */
/* ------------------------------------------------------------------ */

describe("hoverLinePlugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not draw when there is no active element", () => {
    const ctx = createMockCtx();

    const chart = createChart({
      ctx,
      getActiveElements: () => [],
    });

    hoverLinePlugin.afterDatasetsDraw?.(
      chart as unknown as Parameters<
        NonNullable<Plugin<"line">["afterDatasetsDraw"]>
      >[0],
      {},
      {},
      false,
    );
    expect(ctx.save).not.toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it("should not draw when dataset is hidden", () => {
    const ctx = createMockCtx();

    const chart = createChart({
      ctx,
      getActiveElements: () => [{ datasetIndex: 0 } as ActiveElement],
      getDatasetMeta: () => ({
        hidden: true,
        data: [],
      }),
    });

    hoverLinePlugin.afterDatasetsDraw?.(
      chart as unknown as Parameters<
        NonNullable<Plugin<"line">["afterDatasetsDraw"]>
      >[0],
      {},
      {},
      false,
    );

    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it("should draw hover line for valid dataset", () => {
    const ctx = createMockCtx();

    const chart = createChart({
      ctx,
      getActiveElements: () => [{ datasetIndex: 0 } as ActiveElement],
      getDatasetMeta: () => ({
        hidden: false,
        data: [createPoint(10, 20), createPoint(30, 40)],
      }),
      data: {
        datasets: [
          {
            data: [1, 2],
            borderColor: "#ff0000",
          },
        ],
      },
    });

    hoverLinePlugin.afterDatasetsDraw?.(
      chart as unknown as Parameters<
        NonNullable<Plugin<"line">["afterDatasetsDraw"]>
      >[0],
      {},
      {},
      false,
    );

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.rect).toHaveBeenCalledWith(0, 0, 100, 100);
    expect(ctx.clip).toHaveBeenCalled();

    expect(ctx.moveTo).toHaveBeenCalledWith(10, 20);
    expect(ctx.lineTo).toHaveBeenCalledWith(30, 40);

    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it("should break line when encountering NaN values", () => {
    const ctx = createMockCtx();

    const chart = createChart({
      ctx,
      getActiveElements: () => [{ datasetIndex: 0 } as ActiveElement],
      getDatasetMeta: () => ({
        hidden: false,
        data: [createPoint(10, 10), createPoint(20, 20), createPoint(30, 30)],
      }),
      data: {
        datasets: [
          {
            data: [1, NaN, 2],
            borderColor: "#000",
          },
        ],
      },
    });

    hoverLinePlugin.afterDatasetsDraw?.(
      chart as unknown as Parameters<
        NonNullable<Plugin<"line">["afterDatasetsDraw"]>
      >[0],
      {},
      {},
      false,
    );

    expect(ctx.moveTo).toHaveBeenCalledTimes(2);
    expect(ctx.stroke).toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

const createLegendDOM = () => {
  const container = document.createElement("div");
  container.id = LEGEND_CONTAINER;

  const item0 = document.createElement("div");
  item0.setAttribute("data-dataset-index", "0");

  const item1 = document.createElement("div");
  item1.setAttribute("data-dataset-index", "1");

  const item2 = document.createElement("div");
  item2.setAttribute("data-dataset-index", "2");

  container.append(item0, item1, item2);
  document.body.appendChild(container);

  return { container, items: [item0, item1, item2] };
};

/* ------------------------------------------------------------------ */
/* Tests */
/* ------------------------------------------------------------------ */

describe("updateLegendHoverState", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should not throw if legend container does not exist", () => {
    expect(() => {
      updateLegendHoverState(0);
    }).not.toThrow();
  });

  it("should reset all legends when activeDatasetIndex is null", () => {
    const { items } = createLegendDOM();

    updateLegendHoverState(null);

    items.forEach((item) => {
      expect(item.style.opacity).toBe("1");
      expect(item.style.fontWeight).toBe("normal");
    });
  });

  it("should highlight active legend and dim others", () => {
    const { items } = createLegendDOM();

    updateLegendHoverState(1);

    // active
    expect(items[1]?.style.opacity).toBe("1");
    expect(items[1]?.style.fontWeight).toBe("600");

    // others
    expect(items[0]?.style.opacity).toBe("0.4");
    expect(items[0]?.style.fontWeight).toBe("normal");

    expect(items[2]?.style.opacity).toBe("0.4");
    expect(items[2]?.style.fontWeight).toBe("normal");
  });

  it("should ignore elements with invalid data-dataset-index", () => {
    const container = document.createElement("div");
    container.id = LEGEND_CONTAINER;

    const invalidItem = document.createElement("div");
    invalidItem.setAttribute("data-dataset-index", "abc");

    container.appendChild(invalidItem);
    document.body.appendChild(container);

    updateLegendHoverState(0);

    // invalid index -> treated as not active
    expect(invalidItem.style.opacity).toBe("0.4");
    expect(invalidItem.style.fontWeight).toBe("normal");
  });
});

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

const getTooltip = () =>
  document.getElementById(LEGEND_TOOLTIP_ID) as HTMLDivElement | null;

/* ------------------------------------------------------------------ */
/* Tests */
/* ------------------------------------------------------------------ */

describe("Legend tooltip helpers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("getOrCreateLegendTooltip", () => {
    it("should create tooltip if it does not exist", () => {
      const tooltip = getOrCreateLegendTooltip();

      expect(tooltip).toBeInstanceOf(HTMLDivElement);
      expect(tooltip.id).toBe(LEGEND_TOOLTIP_ID);
      expect(document.body.contains(tooltip)).toBe(true);
    });

    it("should return existing tooltip if already created", () => {
      const first = getOrCreateLegendTooltip();
      const second = getOrCreateLegendTooltip();

      expect(second).toBe(first);
      expect(document.querySelectorAll(`#${LEGEND_TOOLTIP_ID}`)).toHaveLength(
        1,
      );
    });

    it("should set default className correctly", () => {
      const tooltip = getOrCreateLegendTooltip();

      expect(tooltip.className).toContain("fixed");
      expect(tooltip.className).toContain("opacity-0");
      expect(tooltip.className).toContain("pointer-events-none");
    });
  });

  describe("showLegendTooltip", () => {
    it("should create tooltip if missing and show it with correct styles", () => {
      showLegendTooltip("Hello tooltip", 120, 300);

      const tooltip = getTooltip();
      expect(tooltip).not.toBeNull();

      expect(tooltip?.textContent).toBe("Hello tooltip");
      expect(tooltip?.style.left).toBe("120px");
      expect(tooltip?.style.top).toBe("308px"); // bottom + 8
      expect(tooltip?.style.opacity).toBe("1");
      expect(tooltip?.style.transform).toBe("translateY(0)");
    });

    it("should reuse existing tooltip", () => {
      const tooltip = getOrCreateLegendTooltip();

      showLegendTooltip("Reuse", 10, 20);

      expect(getTooltip()).toBe(tooltip);
    });
  });

  describe("hideLegendTooltip", () => {
    it("should hide tooltip by setting opacity to 0", () => {
      showLegendTooltip("Hide me", 0, 0);

      const tooltip = getTooltip();
      expect(tooltip?.style.opacity).toBe("1");

      hideLegendTooltip();

      expect(tooltip?.style.opacity).toBe("0");
    });

    it("should not throw if tooltip does not exist", () => {
      expect(() => {
        hideLegendTooltip();
      }).not.toThrow();
    });
  });
});

/* ===============================
 * getLegendContainerId
 * =============================== */

describe("getLegendContainerId", () => {
  it("should return htmlLegend containerID if defined", () => {
    const chart = {
      options: {
        plugins: {
          htmlLegend: { containerID: "custom-id" },
        },
      },
    } as unknown as Chart;

    expect(getLegendContainerId(chart)).toBe("custom-id");
  });

  it("should fallback to default LEGEND_CONTAINER", () => {
    const chart = {
      options: {},
    } as unknown as Chart;

    expect(getLegendContainerId(chart)).toBe("legend-container");
  });
});

/* ===============================
 * CHART_COLORS
 * =============================== */

describe("CHART_COLORS", () => {
  it("should contain predefined css variables", () => {
    expect(Array.isArray(CHART_COLORS)).toBe(true);
    expect(CHART_COLORS.length).toBeGreaterThan(0);
    expect(CHART_COLORS[0]).toContain("--");
  });
});

/* ===============================
 * htmlLegendPlugin
 * =============================== */

describe("htmlLegendPlugin", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="legend-container"></div>`;
  });

  const makeChart = (
    labels: {
      text: string;
      datasetIndex: number;
      fillStyle: string;
      hidden: boolean;
    }[],
    layout?: "default" | "custom-legend",
  ) =>
    ({
      options: {
        plugins: {
          htmlLegend: {
            containerID: "legend-container",
            ...(layout ? { layout } : {}),
          },
          legend: {
            labels: {
              generateLabels: () => labels,
            },
          },
        },
      },
      update: vi.fn(),
    }) as unknown as Chart<"line">;

  it("should render legend items (default layout)", () => {
    const chart = makeChart([
      { text: "Dataset 1", datasetIndex: 0, fillStyle: "#f00", hidden: false },
    ]);

    htmlLegendPlugin.afterUpdate?.(chart, { mode: "default" }, {});

    const container = document.getElementById("legend-container");
    expect(container?.querySelectorAll("[data-dataset-index]")).toHaveLength(1);
  });

  it("should clear previous legend items before re-render", () => {
    const chart = makeChart([
      { text: "Dataset 1", datasetIndex: 0, fillStyle: "#f00", hidden: false },
    ]);

    htmlLegendPlugin.afterUpdate?.(chart, { mode: "default" }, {});
    htmlLegendPlugin.afterUpdate?.(chart, { mode: "default" }, {});

    const container = document.getElementById("legend-container");
    expect(container?.querySelectorAll("[data-dataset-index]")).toHaveLength(1);
  });

  it("should apply line-through style for hidden items", () => {
    const chart = makeChart([
      {
        text: "Hidden Dataset",
        datasetIndex: 0,
        fillStyle: "#f00",
        hidden: true,
      },
    ]);

    htmlLegendPlugin.afterUpdate?.(chart, { mode: "default" }, {});

    const container = document.getElementById("legend-container");
    const textSpan = container?.querySelector("span:last-child");
    expect(textSpan?.className).toContain("line-through");
  });

  it("should render multiple items in custom-legend layout", () => {
    const chart = makeChart(
      [
        {
          text: "Dataset 1",
          datasetIndex: 0,
          fillStyle: "#f00",
          hidden: false,
        },
        {
          text: "Dataset 2",
          datasetIndex: 1,
          fillStyle: "#0f0",
          hidden: false,
        },
        {
          text: "Dataset 3",
          datasetIndex: 2,
          fillStyle: "#00f",
          hidden: false,
        },
      ],
      "custom-legend",
    );

    htmlLegendPlugin.afterUpdate?.(chart, { mode: "default" }, {});

    const container = document.getElementById("legend-container");
    expect(container?.querySelectorAll("[data-dataset-index]")).toHaveLength(3);
  });

  it("should apply 50% flex sizing on items in custom-legend layout", () => {
    const chart = makeChart(
      [
        {
          text: "Dataset 1",
          datasetIndex: 0,
          fillStyle: "#f00",
          hidden: false,
        },
        {
          text: "Dataset 2",
          datasetIndex: 1,
          fillStyle: "#0f0",
          hidden: false,
        },
      ],
      "custom-legend",
    );

    htmlLegendPlugin.afterUpdate?.(chart, { mode: "default" }, {});

    const container = document.getElementById("legend-container");
    const items = container?.querySelectorAll("[data-dataset-index]");
    const firstItem = items?.[0] as HTMLElement | undefined;

    expect(firstItem?.style.flex).toBe("0 0 50%");
    expect(firstItem?.style.maxWidth).toBe("50%");
  });

  it("should insert separators between items but not after last in custom-legend layout", () => {
    const chart = makeChart(
      [
        {
          text: "Dataset 1",
          datasetIndex: 0,
          fillStyle: "#f00",
          hidden: false,
        },
        {
          text: "Dataset 2",
          datasetIndex: 1,
          fillStyle: "#0f0",
          hidden: false,
        },
        {
          text: "Dataset 3",
          datasetIndex: 2,
          fillStyle: "#00f",
          hidden: false,
        },
      ],
      "custom-legend",
    );

    htmlLegendPlugin.afterUpdate?.(chart, { mode: "default" }, {});

    const container = document.getElementById("legend-container");
    // 3 items → 2 separators expected (between each pair)
    const separators = Array.from(
      container?.querySelectorAll(".bg-neutral-100") ?? [],
    );
    expect(separators).toHaveLength(2);
  });

  it("should not insert separators for single item in custom-legend layout", () => {
    const chart = makeChart(
      [
        {
          text: "Dataset 1",
          datasetIndex: 0,
          fillStyle: "#f00",
          hidden: false,
        },
      ],
      "custom-legend",
    );

    htmlLegendPlugin.afterUpdate?.(chart, { mode: "default" }, {});

    const container = document.getElementById("legend-container");
    const separators = Array.from(
      container?.querySelectorAll(".bg-neutral-100") ?? [],
    );
    expect(separators).toHaveLength(0);
  });

  it("should not insert separators in default layout", () => {
    const chart = makeChart(
      [
        {
          text: "Dataset 1",
          datasetIndex: 0,
          fillStyle: "#f00",
          hidden: false,
        },
        {
          text: "Dataset 2",
          datasetIndex: 1,
          fillStyle: "#0f0",
          hidden: false,
        },
      ],
      "default",
    );

    htmlLegendPlugin.afterUpdate?.(chart, { mode: "default" }, {});

    const container = document.getElementById("legend-container");
    const separators = Array.from(
      container?.querySelectorAll(".bg-neutral-100") ?? [],
    );
    expect(separators).toHaveLength(0);
  });
});
