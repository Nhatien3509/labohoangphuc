import { Button } from "@common/components/ui/button";
import IconWithTooltip from "@common/components/containers/IconWithTooltip";

import { ClearContent } from "@common/components/icons";
import SearchResults from "@common/components/layout/searchbar/SearchResults";

import React from "react";
import { type SearchData } from "@common/components/layout/searchbar/SearchBarContainer";
import { type UseFormReturn } from "react-hook-form";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type SearchBarProps = {
  form: UseFormReturn<
    {
      q: string;
    },
    unknown,
    {
      q: string;
    }
  >;
  isHovered: boolean;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>;
  isSearching: boolean;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  isHidden: boolean;
  data: SearchData;
  loadingStates: Record<
    "serviceAction" | "documentationAction" | "marketplaceProductsAction",
    boolean
  >;
};

const SearchBar = ({
  form,
  isSearching,
  isHidden,
  setIsHovered,
  isHovered,
  setIsSearching,
  loadingStates,
  data,
}: SearchBarProps) => {
  const t = useLayoutStore((state) => state.t);

  return (
    <div
      className={cn(
        "z-[14]",
        isHidden ? "opacity-0" : "opacity-100",
        "base-transition",
        "bg-transparent",
        "flex flex-row items-center",
        "absolute right-0 top-0 h-full p-0",
        "rounded-lg shadow-none",
        "max-xl:shadow-D-X0-Y4-B6-S0-25",
        "max-xl:fixed max-xl:right-6 max-xl:top-[4.125rem]",
        "max-xl:p-2.5",
        "max-xl:flex-col max-xl:justify-center",
        "max-xl:rounded-none max-xl:rounded-b-lg",
        "max-xl:bg-background",
        "max-xl:h-auto",
        "max-lg:top-[3.75rem]",
        "max-sm:right-0 max-sm:w-full", // mobile

        {
          "max-md:w-full sm:w-6": isHidden,
          "w-[24.875rem] min-w-fit max-xl:w-[28.125rem]": isHovered,
          "w-[24.875rem] min-w-fit max-xl:w-[28.125rem] xl:w-[27.3125rem] 2xl:w-[32.625rem] 4xl:w-[40.625rem]":
            isSearching,
        },
      )}
    >
      <div
        className={cn(
          "w-full",
          "lg:relative",
          {
            "border xl:border-neutral-500 xl:shadow-D-X0-Y0-B6-S0-30":
              !isHidden,
          },
          "rounded-[6.25rem]",
          "lg:shadow-none",
          "lg:border-neutral-200",
          "h-10 pl-2",
          "flex items-center justify-between",
        )}
      >
        <input
          autoComplete="off"
          spellCheck={false}
          {...form.register("q")}
          maxLength={255}
          onFocus={() => {
            setIsHovered(false);
            if (isSearching) return;
            setIsSearching(true);
          }}
          placeholder={isSearching ? "" : t("header.search.placeholder")}
          className={cn(
            "text-base font-normal leading-5 placeholder:text-sm placeholder:italic placeholder:text-neutral-300",
            "text-neutral-500",
            "h-full w-[84%] pl-3",
            "bg-transparent",
            "max-lg:w-[90%]",
          )}
        />
        {!!form.watch("q").length && isSearching && (
          <Button
            type="button"
            variant="text"
            className={cn(
              "text-button h-fit shrink-0 p-0",
              "pr-10 max-xl:pr-4",
              "z-[16]",
            )}
            onClick={() => {
              form.resetField("q");
              form.setFocus("q");
            }}
          >
            <IconWithTooltip
              tooltipProps={{
                content: t("common.actions.delete"),
              }}
            >
              <ClearContent />
            </IconWithTooltip>
          </Button>
        )}
      </div>
      <SearchResults
        {...{ data, loadingStates, isSearching, setIsSearching }}
      />
    </div>
  );
};

export default SearchBar;
