"use client";
import { DivWrapper } from "@common/components/containers/DivWrapper";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@common/lib/core/utils";

export default function MarqueeText({
  className,
  text,
  ...props
}: React.ComponentProps<"div"> & { text: ReactNode }) {
  const [isOverflow, setIsOverflow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [duration, setDuration] = useState(10);
  const textRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const SPEED = 50; // px/giây
  const MIN_DURATION = 3; // giây

  useEffect(() => {
    const checkOverflowWidth = () => {
      if (!textRef.current || !measureRef.current) {
        return;
      }
      const scrollWidth = measureRef.current.scrollWidth;
      const clientWidth = textRef.current.clientWidth;
      const isOverflow = scrollWidth > clientWidth;

      setIsOverflow(isOverflow);

      if (!isOverflow) return;

      const seconds = scrollWidth / SPEED;
      setDuration(Math.max(seconds, MIN_DURATION));
    };

    checkOverflowWidth();
    window.addEventListener("resize", checkOverflowWidth);

    return () => {
      window.removeEventListener("resize", checkOverflowWidth);
    };
  }, [text, isOverflow, measureRef.current, textRef.current]);

  useEffect(() => {
    const checkMouseInsideComponent = (event: MouseEvent) => {
      if (!containerRef.current) return;

      const { top, left, right, bottom } =
        containerRef.current.getBoundingClientRect();

      const isInside =
        event.clientX >= left &&
        event.clientX <= right &&
        event.clientY >= top &&
        event.clientY <= bottom;

      if (!isInside) {
        setIsHovered(false); // Set to false if the mouse is outside the component
      }
    };

    if (isHovered) {
      document.addEventListener("mousemove", checkMouseInsideComponent);

      return;
    }

    document.removeEventListener("mousemove", checkMouseInsideComponent);

    return () => {
      document.removeEventListener("mousemove", checkMouseInsideComponent);
    };
  }, [isHovered]);

  const getContent = () => {
    if (isOverflow) {
      if (isHovered) {
        return (
          <TooltipContainer isPreventDefault={false} content={text}>
            <div className="w-full truncate">{text}</div>
          </TooltipContainer>
        );
      }
      return (
        <div
          className="flex w-max animate-move whitespace-nowrap"
          style={{ animationDuration: `${duration}s` }}
        >
          <span className="mx-10">{text}</span>
          <span className="mx-10">{text}</span>
        </div>
      );
    }

    return <>{text}</>;
  };

  return (
    <DivWrapper
      ref={containerRef}
      className={cn("w-full overflow-hidden whitespace-nowrap", className)}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      {...props}
    >
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          height: "auto",
          width: "auto",
          padding: 0,
          margin: 0,
          overflow: "visible",
        }}
      >
        {text}
      </div>

      <div ref={textRef} className={cn("w-full")}>
        {getContent()}
      </div>
    </DivWrapper>
  );
}
