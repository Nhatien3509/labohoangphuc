import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@common/components/ui/card";

import React from "react";
import { cn } from "@common/lib/core/utils";

export type CardContainerProps = React.ComponentProps<"div"> & {
  titleNode?: React.ReactNode;
  description?: React.ReactNode;
  contentclassName?: string;
  headerClassname?: string;
  bottomBorder?: boolean;
};

const CardContainer = ({
  className,
  description,
  titleNode,
  children,
  contentclassName,
  headerClassname,
  bottomBorder = true,
  ...props
}: CardContainerProps) => {
  return (
    <Card
      className={cn(
        "shadow-D-X0-Y2-B4-S0-15 dark:shadow-D-X0-Y2-B4-S0-25",
        className,
      )}
      {...props}
    >
      {titleNode && (
        <CardHeader className={cn("space-y-0", headerClassname)}>
          <div className="flex flex-col">
            {typeof titleNode === "string" ? (
              <CardTitle className="text-xl leading-8 tracking-normal">
                {titleNode}
              </CardTitle>
            ) : (
              <>{titleNode}</>
            )}
            {description && (
              <CardDescription className="text-neutral-400">
                {description}
              </CardDescription>
            )}
            {bottomBorder && (
              <div className="border-neutral-10 border-b pt-[0.6875rem]"></div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={contentclassName}>{children}</CardContent>
    </Card>
  );
};

export default CardContainer;
