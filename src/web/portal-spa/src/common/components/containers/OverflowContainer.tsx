"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@common/lib/core/utils";

export type OverflowContainerProps = React.ComponentProps<"div">;

export default function OverflowContainer({
  className,
  children,
}: OverflowContainerProps) {
  const [isEndOfScrollX, setIsEndOfScrollX] = useState(true);
  const [isEndOfScrollY, setIsEndOfScrollY] = useState(true);
  const [isOverflowed, setIsOverflowed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const lastChild = container?.lastElementChild as HTMLDivElement | null;
    if (!lastChild) return;
    const classListArray = Array.from(lastChild.classList);

    const handleScroll = () => {
      const {
        scrollTop,
        scrollLeft,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth,
      } = lastChild;
      if (
        classListArray.some((cls) => cls.includes("overflow-x-auto")) ||
        classListArray.some((cls) => cls.includes("overflow-x-scroll"))
      ) {
        setIsEndOfScrollX(scrollLeft + clientWidth >= scrollWidth - 1);
      }
      if (
        classListArray.some((cls) => cls.includes("overflow-y-auto")) ||
        classListArray.some((cls) => cls.includes("overflow-y-scroll"))
      ) {
        setIsEndOfScrollY(scrollTop + clientHeight >= scrollHeight - 1);
      }
    };

    const checkOverflowWidth = () => {
      setIsOverflowed(
        lastChild.scrollWidth > (containerRef.current?.clientWidth ?? 0) ||
          lastChild.scrollHeight > (containerRef.current?.clientHeight ?? 0),
      );
    };

    const resizeObserver = new ResizeObserver(() => {
      checkOverflowWidth();
      handleScroll();
    });

    const mutationObserver = new MutationObserver(() => {
      checkOverflowWidth();
      handleScroll();
    });

    resizeObserver.observe(lastChild);
    mutationObserver.observe(lastChild, { childList: true, subtree: true });

    window.addEventListener("resize", checkOverflowWidth);
    lastChild.addEventListener("scroll", handleScroll);

    checkOverflowWidth();
    handleScroll();

    return () => {
      lastChild.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkOverflowWidth);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current?.lastElementChild as HTMLDivElement;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const mouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.classList.add("cursor-grabbing");
    };

    const mouseLeaveOrUp = () => {
      isDown = false;
      container.classList.remove("cursor-grabbing");
    };

    const mouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = x - startX;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", mouseDown);
    container.addEventListener("mouseleave", mouseLeaveOrUp);
    container.addEventListener("mouseup", mouseLeaveOrUp);
    container.addEventListener("mousemove", mouseMove);

    return () => {
      container.removeEventListener("mousedown", mouseDown);
      container.removeEventListener("mouseleave", mouseLeaveOrUp);
      container.removeEventListener("mouseup", mouseLeaveOrUp);
      container.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "pointer-events-none absolute bg-gradient-to-l from-neutral-0 to-transparent dark:from-neutral-dark-0 dark:to-transparent",
          className,
          ((isEndOfScrollX && isEndOfScrollY) || !isOverflowed) && "hidden",
        )}
      />
      {children}
    </div>
  );
}
