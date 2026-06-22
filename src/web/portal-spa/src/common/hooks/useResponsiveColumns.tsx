import { useEffect, useMemo, useState } from "react";
import { calculateResponsiveColWidth } from "@common/lib/helpers/numbers";
import equal from "fast-deep-equal/es6";
import useResponsiveWidth from "@common/hooks/useResponsiveWidth";
import { useScrollbarGutter } from "@common/hooks/useScrollbarGutter";

type UseResponsiveColumnsProps = {
  defaultTableWidth: number;
  fixedColumnsWidth?: number;
  defaultColumnWidths: number[];
  defaultNumberOfColumns?: number;
  isOverThousandRows?: boolean;
};

export const useResponsiveColumns = ({
  defaultTableWidth,
  fixedColumnsWidth = 0,
  defaultColumnWidths,
  defaultNumberOfColumns,
  isOverThousandRows = false,
}: UseResponsiveColumnsProps) => {
  const {
    elementRef,
    width: tableWrapperWidth = 0,
    rootFontSize,
    hasRightShadow,
    hasLeftShadow,
  } = useResponsiveWidth();
  const [size, setSize] = useState({ width: 0, scrollHeight: 0 });
  const [defaultColumnWidthsCurrent, setDefaultColumnWidthsCurrent] =
    useState(defaultColumnWidths);

  const hasGutter = useScrollbarGutter();

  const { columnsWidth, autoScaledColumnWidth } = useMemo(() => {
    const el = elementRef.current;
    const rowNumberSize = isOverThousandRows ? 59 : 52;
    const hasVerticalScroll = el && el.scrollHeight > el.clientHeight;
    const gutterSize =
      el && hasGutter && hasVerticalScroll ? getVerticalScrollbarWidth(el) : 0;

    const tableWidthWithoutGutter =
      hasGutter && hasVerticalScroll
        ? tableWrapperWidth - gutterSize
        : tableWrapperWidth;

    const calculatedTableWidth =
      tableWrapperWidth >= defaultTableWidth
        ? tableWidthWithoutGutter
        : defaultTableWidth;

    const columnsWidth = calculateResponsiveColWidth(
      defaultTableWidth,
      calculatedTableWidth,
      fixedColumnsWidth + rowNumberSize,
      ...defaultColumnWidthsCurrent,
    );

    const totalWidthOfSameColumns = columnsWidth[columnsWidth.length - 1];
    const autoScaledColumnWidth =
      defaultNumberOfColumns && totalWidthOfSameColumns
        ? totalWidthOfSameColumns / defaultNumberOfColumns
        : undefined;

    return {
      columnsWidth: [rowNumberSize, ...columnsWidth],
      autoScaledColumnWidth,
    };
  }, [
    tableWrapperWidth,
    rootFontSize,
    hasGutter,
    size.scrollHeight,
    isOverThousandRows,
    defaultColumnWidthsCurrent,
  ]);

  useEffect(() => {
    if (equal(defaultColumnWidths, defaultColumnWidthsCurrent)) return;

    setDefaultColumnWidthsCurrent(defaultColumnWidths);
  }, [defaultColumnWidths]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const update = () => {
      setSize({
        width: el.getBoundingClientRect().width,
        scrollHeight: el.scrollHeight,
      });
    };

    const observer = new ResizeObserver(update);
    observer.observe(el);

    update();

    return () => {
      observer.disconnect();
    };
  }, [elementRef]);

  const measureTable = () => {
    const element = elementRef.current;
    if (!element) return;

    setSize({
      width: element.getBoundingClientRect().width,
      scrollHeight: element.scrollHeight,
    });
  };

  return {
    elementRef,
    tableWrapperWidth,
    rootFontSize,
    hasRightShadow,
    hasLeftShadow,
    columnsWidth,
    autoScaledColumnWidth,
    measureTable,
  };
};

const getVerticalScrollbarWidth = (el: HTMLElement) => {
  // check size scrollbar trên trình duyệt: offsetWidth - clientWidth = scrollbarWidth + borderLeft+borderRight (nếu có border)
  const style = window.getComputedStyle(el);
  const borderX =
    parseFloat(style.borderLeftWidth || "0") +
    parseFloat(style.borderRightWidth || "0");

  const w = el.offsetWidth - el.clientWidth - borderX;
  return Math.max(0, w);
};
