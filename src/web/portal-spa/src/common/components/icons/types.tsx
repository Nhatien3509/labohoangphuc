import type * as React from "react";
import type { ServiceName } from "@common/lib/core/types";

export interface SVG1DProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export interface SVG2DProps extends React.SVGProps<SVGSVGElement> {
  height?: number;
  width?: number;
  className?: string;
}

export type ServiceIconMapType = {
  name: ServiceName;
  iconCode: number;
  icon: React.JSX.Element;
};
