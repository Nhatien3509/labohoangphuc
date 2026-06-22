"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { Button } from "@common/components/ui/button";
import { Card } from "@common/components/ui/card";
import { Checkbox } from "@common/components/ui/checkbox";
import DebounceInput from "@common/components/containers/inputs/DebounceInput";
import TooltipText from "@common/components/containers/TooltipText";

import { CaretDown, Check, SortAZ, SortZA } from "@common/components/icons";

import { type ReactNode, useMemo, useState } from "react";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { type Column } from "@tanstack/react-table";
import type { OptionType } from "@common/lib/core/types";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useQueryParams } from "@common/hooks/useQueryParams";

interface SortCombineFilterHeaderProps<T> {
  children: ReactNode;
  options: OptionType[];
  align?: "start" | "center" | "end";
  isMulti?: boolean;
  column: Column<T>;
  filterKey: string;
  filterKeyTitle: string;
}

type SortOption = {
  order: "asc" | "desc";
  label: string;
  icon: React.ReactNode;
};

const SORT_OPTIONS: SortOption[] = [
  { order: "asc", label: "A-Z", icon: <SortAZ size={24} /> },
  { order: "desc", label: "Z-A", icon: <SortZA size={24} /> },
];

export default function SortableFilterHeader<T>({
  children,
  options,
  align = "end",
  isMulti = false,
  column,
  filterKey,
  filterKeyTitle,
}: Readonly<SortCombineFilterHeaderProps<T>>) {
  const t = useLayoutStore((state) => state.t);
  const { getParams, updateParams } = useQueryParams({
    [filterKey]: [],
  });
  const { [filterKey]: initState = [] } = getParams();

  const [selectedValues, setSelectedValues] = useState<string[]>(initState);

  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredOptions: OptionType[] = useMemo(() => {
    return options.filter((item) =>
      item.label.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()),
    );
  }, [searchValue, options]);

  const itemClassName =
    "h-auto w-full justify-between rounded-none py-2 pl-4 pr-3 leading-8 text-neutral-800 hover:bg-primary-50 hover:font-medium hover:text-neutral-800 focus:text-neutral-800 active:font-semibold active:text-neutral-800 group-focus:font-medium dark:text-neutral-0";

  const handleSelectValues = (
    e: Event,
    isSelected: boolean,
    item: OptionType,
  ) => {
    if (isMulti) {
      const nextSelected = isSelected
        ? selectedValues.filter((s) => s !== item.value)
        : [...selectedValues, item.value];

      setSelectedValues(nextSelected);
      e.preventDefault();
      return;
    }

    const nextValue = isSelected ? [] : [item.value];
    setSelectedValues(nextValue);
    updateParams({ [filterKey]: nextValue.join(",") });
  };

  const buttonAlignClass = {
    start: "w-full !justify-start !pl-0",
    center: "",
    end: "w-full !justify-end !pr-0",
  }[align];
  const isSelectedAll = selectedValues.length === options.length;
  const isSomeSelected = selectedValues.length ? "indeterminate" : false;
  const checkedState: CheckedState = isSelectedAll ? true : isSomeSelected;

  return (
    <div className="text-center">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="text"
            className={cn(
              buttonAlignClass,
              "dark:text-neutral-0 dark:hover:text-neutral-0",
            )}
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            {children}
            <CaretDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className={cn(
            "scrollbar my-1 max-h-[50vh] !w-56 overflow-auto border-none px-0 pb-0 pt-3 !shadow-D-X0-Y0-B10-S0-30",
            {
              "pb-3": !isMulti,
            },
          )}
        >
          <div className="scrollbar">
            {SORT_OPTIONS.map(({ order, label, icon }, idx) => (
              <DropdownMenuItem
                key={order}
                className={cn("group p-0", {
                  "rounded-none border-b border-neutral-100 dark:border-neutral-dark-400":
                    idx === SORT_OPTIONS.length - 1,
                })}
                onSelect={() => {
                  column.toggleSorting(order === "desc");
                }}
              >
                <Button
                  variant="text"
                  className={cn(itemClassName, "justify-start gap-3")}
                  leftIcon={icon}
                  rightIcon={
                    column.getIsSorted() === order && (
                      <Check className="ml-2 shrink-0 text-primary-100" />
                    )
                  }
                >
                  {t("common.actions.sort")} {label}
                </Button>
              </DropdownMenuItem>
            ))}

            <div className="rounded-none border-b border-neutral-100 dark:border-neutral-dark-400">
              <div className="px-3 py-2">
                <DebounceInput
                  onChange={(value) => {
                    setSearchValue(value.toString());
                  }}
                  placeholder={t("common.actions.search") + filterKeyTitle}
                  showSearchIcon
                  value={searchValue}
                />
              </div>
              {isMulti ? (
                <div className="flex gap-2 py-[0.875rem] pl-3 text-base">
                  <Checkbox
                    checked={checkedState}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        setSelectedValues([]);
                        return;
                      }
                      setSelectedValues(options.map((item) => item.value));
                    }}
                  />{" "}
                  <p>
                    {`${t("common.select.all")} (${t("common.select.selected")}`}
                    <span className="font-semibold">{`${selectedValues.length}/${options.length}`}</span>
                    {")"}
                  </p>
                </div>
              ) : (
                <DropdownMenuItem
                  className="p-0"
                  onSelect={() => {
                    setSelectedValues([]);
                    updateParams({ [filterKey]: "" });
                  }}
                >
                  <Button variant="text" className={cn(itemClassName)}>
                    {t("common.select.all")}
                    {!selectedValues.length && (
                      <Check className="ml-2 shrink-0 text-primary-100" />
                    )}
                  </Button>
                </DropdownMenuItem>
              )}
            </div>
            {filteredOptions.map((item) => {
              const isSelected = selectedValues.includes(item.value);
              return (
                <DropdownMenuItem
                  key={item.value}
                  className="p-0"
                  onSelect={(e) => {
                    handleSelectValues(e, isSelected, item);
                  }}
                >
                  <Button variant="text" className={cn(itemClassName, "pl-8")}>
                    <TooltipText
                      isPreventDefault={false}
                      content={item.label}
                      maxWidth={isSelected ? 9 : 11.25}
                    />
                    {isSelected && (
                      <Check className="ml-2 shrink-0 text-primary-100" />
                    )}
                  </Button>
                </DropdownMenuItem>
              );
            })}
          </div>
          {isMulti && (
            <Card className="sticky bottom-0 flex flex-row justify-end gap-3 rounded-t-none border-t border-neutral-100 py-3 pl-4 pr-3 dark:border-neutral-dark-400">
              <Button
                variant="text"
                className={cn(
                  "w-fit justify-between dark:text-neutral-0 dark:hover:text-neutral-0",
                )}
                onClick={() => {
                  setSelectedValues(initState);
                  setIsOpen(false);
                }}
              >
                {t("common.actions.cancel")}
              </Button>
              <Button
                variant="default"
                className={"w-fit justify-between"}
                onClick={() => {
                  updateParams({ [filterKey]: selectedValues });
                  setIsOpen(false);
                }}
              >
                {t("common.actions.apply")}
              </Button>
            </Card>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
