"use client";

import AppLink from "@common/components/containers/AppLink";
import { Button } from "@common/components/ui/button";
import CardContainer from "@common/components/containers/cards/CardContainer";

import { Back } from "@common/components/icons";
import { ForbiddenErrorImage } from "@common/components/images";
import NotFoundCleanup from "@common/components/layout/NotFoundCleanup";
import { ROUTES } from "@common/lib/core/routes";

import React from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const Forbidden = ({
  classNameWrapper,
  className,
}: Readonly<{ classNameWrapper?: string; className?: string }>) => {
  const { t } = useLayoutStore((state) => state);

  return (
    <CardContainer className={classNameWrapper}>
      <div className="flex w-full justify-center">
        <div
          className={cn(
            "flex min-h-[53rem] w-[42.75rem] flex-col items-center gap-6 pt-[4.625rem] text-center",
            className,
          )}
        >
          <ForbiddenErrorImage />
          <span className="text-neutral-400">
            {t("layout.common.errors.forbidden_403.title")}
          </span>
          <AppLink href={ROUTES.dashboard.home}>
            <Button className="group h-9 min-w-[8.375rem]" shape={"round"}>
              <span className="flex size-6 items-center">
                <Back className="group-hover:h-5 group-hover:w-5" />
              </span>
              {t("layout.common.errors.forbidden_403.return")}
            </Button>
          </AppLink>
        </div>
      </div>
      <NotFoundCleanup />
    </CardContainer>
  );
};

export default Forbidden;
