"use client";

import { Button } from "@common/components/ui/button";
import { DivWrapper } from "@common/components/containers/DivWrapper";
import { Form } from "@common/components/ui/form";

import { Loupe } from "@common/components/icons";
import SearchBar from "@common/components/layout/searchbar/SearchBar";

import React, { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { cn } from "@common/lib/core/utils";
import { useActionAPI } from "@common/hooks/useActionAPI";
import { useDebounce } from "@common/hooks/useDebounce";
import { useParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type ServiceItem = { id: string; title?: string; name: string };

export type SearchData = {
  services: ServiceItem[];
  isShown: boolean;
  marketplaceProducts: never[];
  documentation: { title: string; path: string }[];
};

const SearchBarContainer = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const formSchema = z.object({
    q: z.string().trim(),
  });
  const { locale } = useParams<{ locale: string }>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      q: "",
    },
    mode: "onChange",
  });
  const q = useWatch({ control: form.control, name: "q" });

  const isHidden = !(isSearching || isHovered);

  const { executeActionWithKey, loadingStates } = useActionAPI({
    documentationAction: false,
  });

  const [data, setData] = useState<SearchData>({
    services: [],
    isShown: false,
    marketplaceProducts: [],
    documentation: [],
  });

  const preSearchValue = useRef<string>("");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setData((prev) => ({ ...prev, isShown: true }));
    preSearchValue.current = values.q.trim();
  };

  const handleDebounceSearch = useDebounce(onSubmit, 500);

  useEffect(() => {
    if (preSearchValue.current === q.trim()) {
      return;
    }

    handleDebounceSearch({ q });
  }, [q]);

  const handleBlurContainer = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsSearching(false);
  };

  useEffect(() => {
    if (isSearching) {
      return;
    }
    preSearchValue.current = "";
    form.resetField("q");
    setData({
      documentation: [],
      isShown: false,
      marketplaceProducts: [],
      services: [],
    });
  }, [isSearching]);

  void locale;
  void executeActionWithKey;
  void loadingStates;

  return (
    <Form {...form}>
      <DivWrapper
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        onBlur={handleBlurContainer}
        className={cn(
          "relative h-[4.125rem] w-6",
          isHovered && "max-xl:w-[6.875rem]",
        )}
      >
        <SearchBar
          {...{
            form,
            setIsHovered,
            isSearching,
            setIsSearching,
            isHidden,
            isHovered,
            data,
            loadingStates: {
              serviceAction: false,
              documentationAction: false,
              marketplaceProductsAction: false,
            },
          }}
        />

        <Button
          type="button"
          variant="text"
          className={cn(
            "h-full p-0 active:shadow-none",
            "base-transition",
            "absolute right-0 top-0",
            !isHidden && "xl:pr-3",
            "z-[15]",
          )}
          onClick={() => {
            form.setFocus("q");
          }}
        >
          <div className={cn(isHidden ? "w-6" : "w-5 max-xl:w-6")}>
            <Loupe
              size={isHidden ? 24 : 20}
              className={cn(
                "text-neutral-700 dark:text-neutral-dark-300",
                "base-transition",
                isHidden
                  ? "size-6"
                  : "size-5 max-xl:size-6 max-xl:text-primary-200",
              )}
            />
          </div>
        </Button>
      </DivWrapper>
    </Form>
  );
};

export default SearchBarContainer;
