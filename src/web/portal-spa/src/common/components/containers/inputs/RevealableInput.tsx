import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";

import { Eye, EyeSlash } from "@common/components/icons";

import React, { useState } from "react";

export const RevealableInput = ({
  label,
  value,
}: Readonly<{
  label: string;
  value?: string | null;
}>) => {
  const [isShowing, setIsShowing] = useState(false);

  return (
    <Input
      label={label}
      type={isShowing ? "text" : "password"}
      className={
        isShowing ? "pr-[5.25rem]" : "overflow-x-auto text-clip pr-[5.25rem]"
      }
      showCopyIcon
      readOnly
      value={value ?? ""}
      isSecret={!isShowing}
      rightIcon={
        value ? (
          <Button
            variant="text"
            className="solute right-[2.625rem] p-0 hover:text-primary-200 focus:shadow-none active:text-primary-200"
            onClick={() => {
              setIsShowing(!isShowing);
            }}
          >
            {isShowing ? <EyeSlash /> : <Eye />}
          </Button>
        ) : null
      }
    />
  );
};
