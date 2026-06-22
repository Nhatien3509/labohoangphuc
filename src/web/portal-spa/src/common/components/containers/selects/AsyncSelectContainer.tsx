"use client";

import AsyncSelectUI, {
  type AsyncSelectProps as AsyncSelectUIProps,
  type SelectOption,
} from "@common/components/ui/async-select";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import {
  type CurrentValue,
  baseNotAllowedAccessComponent,
  disabledStyles,
  getBaseAllowedAccessComponent,
} from "@common/components/containers/selects/SelectContainer";
import type { FetchResult, GETResponse } from "@/api/types";
import { type GroupBase, type OptionsOrGroups } from "react-select";
import React, { useCallback } from "react";
import type { DefaultParams } from "@common/lib/helpers/params";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import useResponsiveWidth from "@common/hooks/useResponsiveWidth";
import { wrapMenuList } from "react-select-async-paginate";

type Additional = { page: number };

type BaseAsyncSelectProps<T> = AsyncSelectUIProps<T, Additional>;

export interface AsyncSelectContainerProps<T> extends Omit<
  BaseAsyncSelectProps<T>,
  "loadOptions" | "additional" | "debounceTimeout"
> {
  getData: (query?: DefaultParams) => Promise<FetchResult<GETResponse<T>>>;
  queryParam?: string;
  extendsQuery?: DefaultParams;
  labelKey?: keyof T;
  valueKey?: keyof T;
  debounceMs?: number;
  pageSize?: number;
  customItemLabel?: (option: T) => string;
  customItemValue?: (option: T) => string;
  filterOptions?: (data: T[], page?: number, inputValue?: string) => T[];
  isReadyToGetData?: boolean;
}

const AsyncSelectContainerInner = <T,>(
  {
    isAllowedAccess = true,
    getData,
    queryParam = "name",
    labelKey = "name" as keyof T,
    valueKey = "id" as keyof T,
    debounceMs = 500,
    pageSize = 100,
    customItemLabel,
    customItemValue,
    extendsQuery,
    filterOptions,
    isReadyToGetData = true,
    ...props
  }: AsyncSelectContainerProps<T>,
  ref: React.ForwardedRef<React.ElementRef<typeof AsyncSelectUI>>,
) => {
  const { currentProjectId = "", t } = useLayoutStore((s) => ({
    currentProjectId: s.currentProject?.id,
    t: s.t,
  }));
  const { elementRef, width = 20 } = useResponsiveWidth();
  const isOverflowY =
    (elementRef.current?.getBoundingClientRect().height ?? 0) > 36; // 36px is the base height of the component
  const extendsQueryKey = extendsQuery ? flattenQueryParams(extendsQuery) : "";

  function mapToSelectOptions(result: T[]) {
    return result.map((item) => ({
      label: customItemLabel?.(item) ?? String(item[labelKey]),
      value: customItemValue?.(item) ?? String(item[valueKey]),
      raw: item,
    }));
  }

  const loadOptions = useCallback(
    async (
      inputValue: string,
      _loadedOptions: OptionsOrGroups<
        SelectOption<T>,
        GroupBase<SelectOption<T>>
      >,
      additional?: Additional,
    ): Promise<{
      options: SelectOption<T>[];
      hasMore: boolean;
      additional: Additional;
    }> => {
      const page = additional?.page ?? 1;

      const result = await (isReadyToGetData
        ? getData({
            page,
            pageSize,
            [queryParam]: inputValue,
            ...extendsQuery,
          })
        : EMPTY_RESULT);

      if (!result.success || !result.data || result.data.results.length === 0) {
        const filterResults = filterOptions?.([], page, inputValue) ?? [];
        const options: SelectOption<T>[] = mapToSelectOptions(filterResults);
        return {
          options: options,
          hasMore: false,
          additional: { page },
        };
      }

      const { results, next } = result.data;

      const filterResults = filterOptions
        ? filterOptions(results, page, inputValue)
        : results;
      const options: SelectOption<T>[] = mapToSelectOptions(filterResults);

      const hasMore = !!next;

      return {
        options,
        hasMore,
        additional: hasMore ? { page: page + 1 } : { page },
      };
    },
    [
      getData,
      pageSize,
      queryParam,
      labelKey,
      valueKey,
      extendsQueryKey,
      isReadyToGetData,
    ],
  );

  const dummyLoadOptions = useCallback(
    () => ({
      options: [] as SelectOption<T>[],
      hasMore: false,
      additional: { page: 1 },
    }),
    [],
  );

  const baseAllowedAccessComponent = getBaseAllowedAccessComponent<
    SelectOption<T>,
    false
  >({
    width,
    createLabel: props.createLabel,
    isCreatable: props.isCreatable,
    onCreate: props.onCreate,
    currentValue: props.value as CurrentValue<SelectOption<T>, false>,
  });

  const asyncComponents = {
    ...baseAllowedAccessComponent,
    MenuList: wrapMenuList<
      SelectOption<T>,
      boolean,
      GroupBase<SelectOption<T>>
    >(baseAllowedAccessComponent.MenuList),
  };

  if (isAllowedAccess)
    return (
      <div ref={elementRef}>
        <AsyncSelectUI<T, Additional>
          ref={ref}
          key={currentProjectId + extendsQueryKey} // reset when project or query changes
          clearCacheOnMenuClose
          defaultOptions
          loadOptions={loadOptions}
          additional={{ page: 1 }}
          debounceTimeout={debounceMs}
          isOverflowY={isOverflowY}
          placeholder={props.placeholder ?? ""}
          {...props}
          components={{
            ...asyncComponents,
            ...props.components,
          }}
        />
      </div>
    );

  return (
    <TooltipContainer content={t("common.allowed_actions.no_access")}>
      <div ref={elementRef}>
        <AsyncSelectUI<T, Additional>
          {...props}
          isDisabled
          loadOptions={dummyLoadOptions}
          additional={{ page: 1 }}
          debounceTimeout={debounceMs}
          className={cn(
            "group w-full text-base dark:bg-neutral-200",
            props.className,
          )}
          ref={ref}
          inputId={props.id}
          instanceId={`${props.id}-instance`}
          placeholder={props.placeholder ?? ""}
          components={{
            ...baseNotAllowedAccessComponent,
            ...props.components,
          }}
          styles={disabledStyles}
        />
      </div>
    </TooltipContainer>
  );
};

AsyncSelectContainerInner.displayName = "AsyncSelectContainer";

const AsyncSelectContainer = React.forwardRef(AsyncSelectContainerInner) as <T>(
  props: AsyncSelectContainerProps<T> & {
    ref?: React.ForwardedRef<React.ElementRef<typeof AsyncSelectUI>>;
  },
) => React.JSX.Element;

export default AsyncSelectContainer;

/**
 * Flattens query parameter values into a single string joined by separator
 * @param params - The query parameters to flatten
 * @param separator - The separator to join values (default: "-")
 * @returns A single string with all values joined
 */
const flattenQueryParams = (params: DefaultParams, separator = "-"): string => {
  const values: string[] = [];

  const collectValues = (
    obj: DefaultParams | string | number | boolean | (string | number)[],
  ): void => {
    // Primitive types: string, number, boolean
    if (
      typeof obj === "string" ||
      typeof obj === "number" ||
      typeof obj === "boolean"
    ) {
      values.push(String(obj));
    }
    // Array
    else if (Array.isArray(obj)) {
      obj.forEach((item) => {
        collectValues(item);
      });
    }
    // Object (reference type)
    else if (typeof obj === "object") {
      for (const key in obj) {
        const value = obj[key];
        if (value !== undefined) {
          collectValues(value);
        }
      }
    }
  };

  collectValues(params);
  return values.join(separator);
};

const EMPTY_RESULT = Promise.resolve({
  success: true,
  status: 200,
  data: { results: [], count: 0, next: null, previous: null },
});
