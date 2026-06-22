"use client";

import { Button } from "@common/components/ui/button";

import { useEffect, useRef } from "react";

export default function AutoClickButton({
  ...props
}: React.ComponentPropsWithRef<typeof Button>) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.click();
    }
  }, []);

  return <Button ref={buttonRef} className="hidden" {...props} />;
}
