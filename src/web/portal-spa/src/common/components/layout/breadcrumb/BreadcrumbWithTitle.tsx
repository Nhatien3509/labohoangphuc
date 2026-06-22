"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@common/components/ui/breadcrumb";
import AppLink from "@common/components/containers/AppLink";
import { Fragment } from "react";
import { Home } from "@common/components/icons";
import PageTitle from "@common/components/layout/breadcrumb/PageTitle";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import {
  type BreadcrumbConfig,
  useBreadcrumb,
} from "@common/hooks/useBreadcrumb";
import { ROUTES } from "@common/lib/core/routes";
import { cn } from "@common/lib/core/utils";

export default function BreadcrumbWithTitle({
  breadcrumbConfig,
  hasHomeIcon = true,
  className = "",
}: Readonly<{
  breadcrumbConfig: Record<string, BreadcrumbConfig>;
  hasHomeIcon?: boolean;
  className?: string;
}>) {
  const { label, parents } = useBreadcrumb(breadcrumbConfig);

  if (!label || parents.length === 0) return null;

  return (
    <div>
      <Breadcrumb className={cn("mt-3 max-lg:hidden", className)}>
        <BreadcrumbList>
          {hasHomeIcon && (
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <AppLink
                  href={ROUTES.dashboard.home}
                  className="focus-visible focus-visible:rounded"
                >
                  <Home className="cursor-pointer text-neutral-700 hover:text-primary-200 dark:text-white" />
                </AppLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}

          {parents.map((breadcrumb, index) => (
            <Fragment key={crypto.randomUUID()}>
              {(hasHomeIcon || index !== 0) && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <AppLink
                    className="h-4 border-b border-transparent leading-4 text-neutral-800 hover:text-primary-200 focus-visible:border-b focus-visible:border-primary-200 dark:text-white"
                    href={breadcrumb.href}
                  >
                    {breadcrumb.tooltipContent ? (
                      <TooltipContainer
                        content={breadcrumb.tooltipContent}
                        className="max-w-[20rem]"
                      >
                        <span className="break-all">{breadcrumb.label}</span>
                      </TooltipContainer>
                    ) : (
                      <span className="break-all">{breadcrumb.label}</span>
                    )}
                  </AppLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}

          <BreadcrumbSeparator />
          <BreadcrumbPage className="break-all font-semibold leading-4 text-neutral-800 dark:text-neutral-0">
            {label}
          </BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle hasBack={true} />
    </div>
  );
}
