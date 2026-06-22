import useMousePosition from "@common/hooks/useMousePosition";

export const MouseSafeArea = ({ submenu }: { submenu: HTMLDivElement }) => {
  const { x: mouseX, y: mouseY } = useMousePosition();

  const {
    height: submenuHeight,
    x: submenuX,
    y: submenuY,
  } = submenu.getBoundingClientRect();

  const svgWidth = submenuX - mouseX + 2;
  const svgHeight = submenuHeight;

  return (
    <svg
      style={{
        position: "fixed",
        width: svgWidth,
        cursor: "pointer",
        height: submenuHeight,
        pointerEvents: "none",
        zIndex: 50,
        top: submenu.offsetTop - 2,
        left: mouseX - 2,
      }}
      id="svg-safe-area"
    >
      <path
        pointerEvents="none"
        width="100%"
        height="100%"
        cursor="pointer"
        fill="transparent"
        d={`M 0,0 L ${svgWidth},0 L ${svgWidth},${svgHeight} L 0,${svgHeight} z`}
      />
      <path
        pointerEvents="auto"
        stroke="none"
        strokeWidth="0.5"
        fill="transparent"
        d={`M 0, ${mouseY - submenuY} 
            L ${svgWidth},${svgHeight}  
            L ${svgWidth},0 z`}
      ></path>
    </svg>
  );
};
