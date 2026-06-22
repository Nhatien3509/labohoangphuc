"use client";

import AppLink from "@common/components/containers/AppLink";
import { Button } from "@common/components/ui/button";
import CardContainer from "@common/components/containers/cards/CardContainer";

import { Back } from "@common/components/icons";
import NotFoundCleanup from "@common/components/layout/NotFoundCleanup";
import { NotFoundImage } from "@common/components/images";
import { ROUTES } from "@common/lib/core/routes";

import React, { useEffect } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const NotFound = () => {
  const { updateKey, t } = useLayoutStore((state) => state);

  useEffect(() => {
    updateKey("isNotFound", true);
    return () => {
      updateKey("isNotFound", false);
    };
  }, []);

  return (
    <CardContainer className="shadow-none">
      <div className="flex w-full justify-center">
        <div
          className={`my-auto flex min-h-[49.9375rem] w-[45.25rem] flex-col items-center justify-center gap-2.5`}
        >
          <div className="m-2.5">
            <NotFoundImage />
          </div>
          <div className="m-2.5 flex flex-col items-center gap-2">
            <span className="py-[0.3125rem] text-5xl font-semibold uppercase text-primary-100">
              {t("common.errors.not_found_404.title")}
            </span>
            <AppLink className="m-2.5" href={ROUTES.dashboard.home}>
              <Button
                className="h-9 min-w-[8.375rem]"
                shape={"round"}
                variant={"default"}
              >
                <span className="flex size-6 items-center">
                  <Back />
                </span>
                {t("common.errors.not_found_404.return")}
              </Button>
            </AppLink>
          </div>
        </div>
      </div>
      <NotFoundCleanup />
    </CardContainer>
  );
};

export default NotFound;
