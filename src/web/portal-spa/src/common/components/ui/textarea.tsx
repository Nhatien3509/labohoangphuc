import CopyContainer from "@common/components/containers/CopyContainer";
import { Label } from "@common/components/ui/label";

import * as React from "react";
import { cn } from "@common/lib/core/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCopyIcon?: boolean;
  label?: React.ReactNode;
  desc?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCopyIcon = false, label, desc, ...props }, ref) => {
    return (
      <div className="grid w-full items-center gap-1">
        {label && <Label htmlFor={props.name}>{label}</Label>}
        {desc && <p className="text-base text-neutral-400">{desc}</p>}
        <div className="relative flex w-full items-end">
          <textarea
            ref={ref}
            className={cn(
              "scrollbar flex min-h-24 w-full rounded-sm border border-neutral-200 py-2 pl-3 text-base file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-neutral-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-neutral-300 dark:bg-neutral-dark-50",
              "read-only:border-none read-only:bg-neutral-100 read-only:!shadow-none hover:border-neutral-500 hover:shadow-D-X0-Y0-B6-S0-30 read-only:hover:border-neutral-100 focus:border-neutral-500 focus:shadow-D-X0-Y0-B6-S0-30",
              "pr-3",
              {
                "pr-9": showCopyIcon,
              },
              className,
            )}
            {...props}
          />
          {showCopyIcon && (
            <div className="absolute right-2 top-2">
              <CopyContainer size={20} message={props.value as string} />
            </div>
          )}
        </div>
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
