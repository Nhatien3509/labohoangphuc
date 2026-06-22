"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@common/components/ui/avatar";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import {
  getFirstAndLastName,
  getInitials,
  toTitleCase,
} from "@common/lib/helpers/str";
import { CaretDown } from "@common/components/icons";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import useResponsiveWidth from "@common/hooks/useResponsiveWidth";

export default function ProfileButton() {
  const { currentUser } = useLayoutStore((state) => state);
  const fullName = `${currentUser?.lastName ?? ""} ${currentUser?.firstName ?? ""}`;
  const firstAndLastName = toTitleCase(getFirstAndLastName(fullName));

  const initials = getInitials(firstAndLastName);
  const { elementRef: textContainerRef, isOverflowed } = useResponsiveWidth({
    maxWidth: 6.25,
  });

  return (
    <TooltipContainer content={isOverflowed ? firstAndLastName : ""}>
      <div className="flex h-full w-full items-center justify-between gap-1 pl-3 pr-2 max-lg:px-0">
        <div className="flex h-full items-center focus:shadow-none max-lg:p-[0.3125rem]">
          <Avatar className="size-6 max-lg:size-[1.875rem]">
            <AvatarImage alt={initials} src="" />
            <AvatarFallback className="bg-neutral-500 text-neutral-50 dark:bg-neutral-dark-800 dark:text-neutral-dark-0">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="max-w-[7.25rem] flex-1 px-2 text-left font-normal max-lg:hidden">
          <div ref={textContainerRef} className="max-w-[6.25rem]">
            <span className="block overflow-hidden text-ellipsis whitespace-pre group-hover/item:font-semibold group-active/item:font-semibold group-data-[state=open]/item:font-semibold">
              {firstAndLastName}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <CaretDown />
        </div>
      </div>
    </TooltipContainer>
  );
}
