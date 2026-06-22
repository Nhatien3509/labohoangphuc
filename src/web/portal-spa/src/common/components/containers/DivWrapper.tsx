import { type HTMLAttributes, forwardRef } from "react";

export const DivWrapper = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props} />);
