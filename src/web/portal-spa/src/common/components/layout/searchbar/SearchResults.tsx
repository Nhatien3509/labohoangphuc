import { DivWrapper } from "@common/components/containers/DivWrapper";
import SkeletonContainer from "@common/components/containers/SkeletonContainer";

import React, { type ReactNode, memo, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { type SearchData } from "@common/components/layout/searchbar/SearchBarContainer";
type Service = {
  id: string;
  title?: string;
  name: string;
  active?: boolean;
  available?: boolean;
};
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useParams } from "next/navigation";

type SearchResultsProps = {
  data: SearchData;
  loadingStates: Record<
    "serviceAction" | "documentationAction" | "marketplaceProductsAction",
    boolean
  >;
  isSearching: boolean;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
};

type SearchResultSection<T> = {
  key: string;
  isLoading: boolean;
  data: T[];
  title: string;
  renderItem: (item: T, index: number) => React.ReactNode;
};

type ServiceSection = SearchResultSection<
  Omit<Service, "active" | "available">
> & {
  renderItem: (
    item: Omit<Service, "active" | "available">,
    index: number,
  ) => ReactNode;
};
type GraphqlSection = SearchResultSection<{ title: string; path: string }> & {
  renderItem: (
    item: { title: string; path: string },
    index: number,
  ) => ReactNode;
};

const SearchResults = ({
  isSearching,
  data,
  loadingStates,
  setIsSearching,
}: SearchResultsProps) => {
  const { t, launchingServices, updateLayoutDialogState, url, isLoggedIn } =
    useLayoutStore((state) => ({
      t: state.t,
      launchingServices: state.launchingServices,
      updateLayoutDialogState: state.updateLayoutDialogState,
      url: state.url,
      isLoggedIn: state.isLoggedIn,
    }));

  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const { locale } = useParams<{ locale: string }>();
  const documentUrl = `${url.DOCS_URL}${locale === "en" ? "/en/documentation/" : "/documentation/"}`;
  const scrollRef = useRef<HTMLDivElement>(null);

  const sections: (ServiceSection | GraphqlSection)[] = useMemo(
    () => [
      {
        key: "services",
        isLoading: loadingStates.serviceAction,
        data: data.services,
        title: t("common.transaction_details.services"),
        renderItem: (
          item: Omit<Service, "active" | "available">,
          index: number,
        ) => {
          const launchingItem = launchingServices.find(
            ({ name }) => name === item.name,
          );

          return (
            <RenderItem
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              isExternal={false}
              key={item.id}
              title={item.title}
              href={
                !isLoggedIn
                  ? `/login?returnUrl=${window.location.href}`
                  : (launchingItem?.homeHref ?? "/")
              }
              onClick={(e) => {
                if (!isLoggedIn) return;
                e.currentTarget.focus();
                if (launchingItem) {
                  setIsSearching(false);
                  return;
                }
                e.preventDefault();
                updateLayoutDialogState({
                  coming_soon: { isOpen: true },
                });
              }}
            />
          );
        },
      },
      {
        key: "document",
        isLoading: loadingStates.documentationAction,
        data: data.documentation,
        title: t("header.documentation"),
        renderItem: (item: { title: string; path: string }, index: number) => (
          <RenderItem
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            key={item.path}
            title={item.title}
            href={documentUrl + item.path}
          />
        ),
      },
    ],
    [loadingStates, data],
  );

  const renderContent = () => {
    if (!isSearching) return null;

    const isEmptyData = sections.every(
      ({ data, isLoading }) => data.length === 0 && !isLoading,
    );
    let globalIndex = 0;

    return (
      <div
        className={cn(
          "py-3",
          {
            hidden: !data.isShown,
          },
          isEmptyData ? "h-fit" : "min-h-8",
        )}
      >
        <div
          ref={scrollRef}
          className={cn(
            "scrollbar overflow-y-auto base-transition",
            "max-h-[19rem]",
            {
              "space-y-2 px-6 text-[100%] italic max-xl:text-base": isEmptyData,
            },
          )}
        >
          {isEmptyData ? (
            <> {t("header.search.no_data")}</>
          ) : (
            sections.map((section) => {
              const { key, isLoading, data, title, renderItem } = section;
              const filteredData =
                key === "services"
                  ? (data as Service[]).filter((item) => item.title)
                  : data;

              if (isLoading)
                return (
                  <SkeletonContainer
                    className="h-5"
                    skeletonCount={1}
                    containerClassName="px-6 py-2 max-xl:px-[0.875rem]"
                    key={key}
                  />
                );

              if (filteredData.length === 0) return null;
              const renderedItems = filteredData.map((item, index) => {
                const currentIndex = globalIndex + index;
                if (key === "services") {
                  return (
                    renderItem as (item: Service, index: number) => ReactNode
                  )(item as Service, currentIndex);
                }

                if (key === "document") {
                  return (
                    renderItem as (
                      item: { title: string; path: string },
                      index: number,
                    ) => ReactNode
                  )(item as { title: string; path: string }, currentIndex);
                }

                return null;
              });
              globalIndex += filteredData.length;

              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-[2.75rem] space-y-2 px-6 py-2",
                    "max-xl:px-[0.875rem]",
                  )}
                >
                  <div className="text-[100%] font-semibold uppercase text-neutral-700 max-xl:text-base">
                    {title}
                  </div>

                  {renderedItems}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!data.isShown) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = itemRefs.current.findIndex(
        (el) => el === document.activeElement,
      );
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % itemRefs.current.length;
        itemRefs.current[nextIndex]?.focus();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          (currentIndex - 1 + itemRefs.current.length) %
          itemRefs.current.length;
        itemRefs.current[prevIndex]?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <DivWrapper
      className={cn(
        isSearching
          ? "animate-in fade-in-0 zoom-in-95"
          : "hidden animate-out fade-out-0 zoom-out-95",
        "z-50 text-left text-neutral-500",
        "shadow-D-X0-Y0-B6-S0-30 outline-none slide-in-from-top-2",
        "bg-neutral-0 leading-5",
        "w-[20.625rem] xl:w-[27.3125rem] 2xl:w-[32.625rem] 4xl:w-[40.625rem]",
        "absolute right-0 top-[3.875rem] rounded-lg",
        "max-xl:static max-xl:w-full max-xl:shadow-none",
        "max-lg:w-full",
        "cursor-default",
        "duration-300",
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
      }}
    >
      {renderContent()}
    </DivWrapper>
  );
};

const RenderItem = React.forwardRef<
  HTMLAnchorElement,
  {
    isExternal?: boolean;
    href: string;
    title?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }
>(({ isExternal = true, href, title, onClick }, ref) => (
  <Link
    ref={ref}
    {...(isExternal && {
      target: "_blank",
      rel: "noopener noreferrer",
    })}
    href={href}
    onClick={
      onClick ??
      ((e) => {
        e.currentTarget.focus();
      })
    }
    className="block text-base hover:text-primary-100 focus:text-primary-200 active:text-primary-200"
  >
    {title}
  </Link>
));

export default memo(SearchResults);
