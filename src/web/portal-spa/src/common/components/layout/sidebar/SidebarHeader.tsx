import Image from "next/image";
import React from "react";

type SidebarHeaderProps = {
  readonly title: string;
  readonly subtitle?: string;
  readonly logo?: string;
};

const SidebarHeader = ({ title, subtitle, logo }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-4 max-lg:hidden">
      {logo && (
        <div className="shrink-0">
          <Image src={logo} alt="logo" width={40} height={40} />
        </div>
      )}
      <div className="flex flex-col">
        <h1 className="text-sm font-bold leading-tight text-neutral-900 dark:text-neutral-dark-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-xs leading-tight text-neutral-500 dark:text-neutral-dark-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default SidebarHeader;
