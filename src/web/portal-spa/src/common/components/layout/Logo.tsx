"use client";

import AppLink from "@common/components/containers/AppLink";

import {
  LogoBeta,
  LogoMarketplaceBeta,
  LogoMiniBeta,
} from "@common/components/images";
import NavMenu from "@common/components/layout/navigation-menu/NavMenu";
import ProjectManagement from "@common/components/layout/project-management/ProjectManagement";

import { ROUTES } from "@common/lib/core/routes";
import React from "react";
import { cn } from "@common/lib/core/utils";
import { usePathname } from "next/navigation";

const Logo = ({ isLoggedIn }: Readonly<{ isLoggedIn: boolean }>) => {
  const pathname = usePathname();
  const isMarketplace = pathname.includes("marketplace");

  return (
    <div className="flex items-center gap-6">
      <div className="flex h-full w-[16.375rem] items-center max-lg:w-fit">
        <div
          className={cn(
            "flex",
            !isMarketplace && "w-full",
            "max-lg:justify-center max-lg:gap-6",
          )}
        >
          <div className="flex items-center justify-between gap-6 lg:w-full">
            <NavMenu />
            <AppLink
              href={
                isMarketplace ? ROUTES.marketplace.home : ROUTES.dashboard.home
              }
            >
              <div className="flex max-lg:items-center">
                {isMarketplace ? (
                  <LogoMarketplaceBeta className="focus-visible:shadow-D-X0-Y0-B6-S0-30 max-lg:hidden" />
                ) : (
                  <LogoBeta className="cursor-pointer focus-visible:shadow-D-X0-Y0-B6-S0-30 max-lg:hidden" />
                )}
                <LogoMiniBeta className="lg:hidden" />
              </div>
            </AppLink>
          </div>
          {isLoggedIn && !isMarketplace && (
            <ProjectManagement triggerClassName="lg:hidden" />
          )}
        </div>
      </div>

      {isLoggedIn && !isMarketplace && (
        <ProjectManagement triggerClassName="max-lg:hidden" />
      )}
    </div>
  );
};

export default Logo;
