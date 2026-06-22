import "rc-slider/assets/index.css";
import React, { useState } from "react";
import Slider, { type SliderProps, type SliderRef } from "rc-slider";

export type { SliderProps, SliderRef };

interface SliderContainerProps extends React.ComponentPropsWithoutRef<
  typeof Slider
> {
  valueTemp?: number;
}

const SliderContainer = React.forwardRef<
  React.ElementRef<typeof Slider>,
  SliderContainerProps
>(({ valueTemp, ...props }, ref) => {
  const handleRender: SliderProps["handleRender"] = (node) => (
    <SliderHandleRender node={node} valueTemp={valueTemp} />
  );

  return (
    <Slider
      ref={ref}
      className="!h-4 !py-1.5"
      activeDotStyle={{
        display: "none",
      }}
      dotStyle={{
        display: "none",
      }}
      styles={{
        rail: {
          backgroundColor: "var(--neutral-400)",
        },
        track: {
          backgroundColor: "var(--primary-100)",
          borderRadius: "0.5rem",
        },
        handle: {
          backgroundColor: "var(--primary-100)",
          border: "none",
          boxShadow: "none",
          opacity: 1,
          width: "1rem",
          height: "1rem",
          zIndex: "inherit",
          transform: "translateY(-100%) translateX(-50%)",
        },
      }}
      handleRender={handleRender}
      {...props}
    />
  );
});

SliderContainer.displayName = "SliderContainer";

export default SliderContainer;

interface SliderHandleRenderProps {
  node: React.ReactNode;
  valueTemp?: number;
}

const SliderHandleRender: React.FC<SliderHandleRenderProps> = ({
  node,
  valueTemp,
}) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTooltipPosition({
      top: mouseY - 30,
      left: mouseX + 10,
    });
  };

  return (
    <div className="relative cursor-pointer text-base">
      <button
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
        onMouseMove={handleMouseMove}
      >
        {hovered && (
          <div
            className="absolute whitespace-nowrap rounded bg-neutral-950 px-2 py-1 text-xs text-neutral-0"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
          >
            {valueTemp}
          </div>
        )}
        {node}
      </button>
    </div>
  );
};
