import { useEffect, useRef, useState } from "react";

const useResponsiveWidth = <T extends HTMLElement = HTMLDivElement>({
  maxWidth,
}: { maxWidth?: number } = {}) => {
  const [width, setWidth] = useState<number>();
  const [isOverflowed, setIsOverflowed] = useState(false);
  const [rootFontSize, setRootFontSize] = useState(16);
  const [hasRightShadow, setHasRightShadow] = useState(false);
  const [hasLeftShadow, setHasLeftShadow] = useState(false);
  const elementRef = useRef<T>(null);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    const updateState = (timeout = 50) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const currentRootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      setRootFontSize(currentRootFontSize);

      if (!elementRef.current) return;

      const el = elementRef.current;
      setWidth(el.getBoundingClientRect().width);

      if (maxWidth) {
        setIsOverflowed(
          el.clientWidth >= Math.floor(maxWidth * currentRootFontSize),
        );
      }

      timeoutRef.current = window.setTimeout(() => {
        const hasScroll = el.scrollWidth > el.clientWidth;
        const notAtEnd =
          Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth;
        const notAtStart = el.scrollLeft !== 0;

        setHasRightShadow(hasScroll && notAtEnd);
        setHasLeftShadow(hasScroll && notAtStart);
      }, timeout);
    };

    const handleScroll = () => {
      updateState(0);
    };
    const handleResize = () => {
      updateState();
    };

    updateState();

    const el = elementRef.current;
    const observer = el
      ? new ResizeObserver(() => {
          updateState(0);
        })
      : null;

    observer?.observe(el as Element);
    el?.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      observer?.disconnect();
      el?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [elementRef.current, maxWidth]);

  return {
    elementRef,
    width,
    rootFontSize,
    hasRightShadow,
    hasLeftShadow,
    isOverflowed,
  };
};

export default useResponsiveWidth;
