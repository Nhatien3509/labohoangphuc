"use client";

import {
  AsyncPaginate,
  type ComponentProps as AsyncPaginateComponentProps,
  type UseAsyncPaginateParams,
} from "react-select-async-paginate";
import type ReactSelect from "react-select";

import type { GroupBase, Props as SelectPropsBase } from "react-select";
import React, { useId, useMemo } from "react";
import type { ExtraSelectProps } from "@common/components/ui/select";
import type { OptionType } from "@common/lib/core/types";
import { cn } from "@common/lib/core/utils";
import { useSelectCommonProps } from "@common/hooks/useSelectCommonProps";
import { withExtraProps } from "../containers/Hoc";

export interface SelectOption<T> extends OptionType {
  raw: T;
}

export interface AsyncSelectProps<T, Additional = unknown>
  extends
    SelectPropsBase<SelectOption<T>, boolean, GroupBase<SelectOption<T>>>,
    UseAsyncPaginateParams<
      SelectOption<T>,
      GroupBase<SelectOption<T>>,
      Additional
    >,
    AsyncPaginateComponentProps<
      SelectOption<T>,
      GroupBase<SelectOption<T>>,
      boolean
    >,
    ExtraSelectProps {}

type ReactSelectInstance = React.ElementRef<typeof ReactSelect>;

const AsyncSelectUIInner = <T, Additional = unknown>(
  { id, readOnly, ...props }: AsyncSelectProps<T, Additional>,
  ref: React.ForwardedRef<ReactSelectInstance>,
) => {
  const { inputValue, commonProps } = useSelectCommonProps<
    SelectOption<T>,
    boolean,
    GroupBase<SelectOption<T>>
  >({
    id,
    readOnly,
    props,
  });

  const patchedProps = {
    ...props,
    ...(inputValue &&
      !props.isMulti && {
        value: {
          value: inputValue,
          label: inputValue,
          raw: {} as T,
        },
        isClearable: true,
      }),
  } satisfies AsyncSelectProps<T, Additional>;

  return (
    <AsyncPaginate<
      SelectOption<T>,
      GroupBase<SelectOption<T>>,
      Additional,
      boolean
    >
      openMenuOnFocus
      {...patchedProps}
      {...commonProps}
      loadingMessage={withExtraProps(LoadingIndicator, {})}
      selectRef={ref as never}
    />
  );
};

AsyncSelectUIInner.displayName = "AsyncSelectUI";

export const AsyncSelectUI = React.forwardRef(AsyncSelectUIInner) as <
  T,
  Additional = unknown,
>(
  props: AsyncSelectProps<T, Additional> & {
    ref?: React.ForwardedRef<ReactSelectInstance>;
  },
) => React.JSX.Element;

export default AsyncSelectUI;

export const LoadingIndicator = () => {
  const id = useId();
  const LOADING_TEXT = "Loading";
  const DOT_COUNT = 3;
  const STEP = 80;
  const dots = useMemo(
    () =>
      Array.from({ length: DOT_COUNT }, (_, n) => {
        const delay = n * STEP;
        return { key: `${id}-dot-${delay}`, delay };
      }),
    [DOT_COUNT, STEP, id],
  );
  const chars = useMemo(() => {
    const counts = new Map<string, number>();
    let pos = DOT_COUNT; // tiếp nối sau 3 dots

    return Array.from(LOADING_TEXT).map((ch) => {
      const safeCh = ch === " " ? "\u00A0" : ch;

      const seen = (counts.get(ch) ?? 0) + 1;
      counts.set(ch, seen);

      const delay = pos * STEP;
      pos += 1;

      const key = `${id}-char-${ch || "space"}-${seen}`;
      return { key, ch: safeCh, delay };
    });
  }, [LOADING_TEXT, DOT_COUNT, STEP, id]);

  return (
    <div className="text-base italic text-neutral-800">
      <span className="inline-flex items-center">
        {dots.map((d, idx) => (
          <span
            key={d.key}
            className={cn(
              "mr-1 block h-1 w-1 animate-loading-wave rounded bg-neutral-800",
              {
                "mr-3": idx === dots.length - 1,
              },
            )}
            style={{ animationDelay: `${d.delay}ms` }}
          />
        ))}
        {chars.map((c) => (
          <span
            key={c.key}
            className="animate-loading-wave"
            style={{ animationDelay: `${c.delay}ms` }}
          >
            {c.ch}
          </span>
        ))}
      </span>
    </div>
  );
};
