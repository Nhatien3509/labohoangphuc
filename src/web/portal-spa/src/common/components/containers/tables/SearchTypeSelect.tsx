import AsyncSelectContainer from "@common/components/containers/selects/AsyncSelectContainer";
import SelectContainer from "@common/components/containers/selects/SelectContainer";

import { useEffect, useState } from "react";
import { type OptionType } from "@common/lib/core/types";
import { type SearchTypeConfig } from "@common/components/containers/tables/CommonTable";
import { type SelectOption } from "@common/components/ui/async-select";

type BaseSearchTypesProps = {
  currentPage?: string;
  handleSearchChange: (value: string | number) => void;
  searchPlaceholderOptions?: Record<string, string>;
  searchMaxLength: number;
  searchValue: string;
  defaultPlaceholder: string;
  defaultSearchField?: string;
};

type FixedSearchTypesProps = BaseSearchTypesProps & {
  searchType: OptionType[];
};

type DynamicSearchTypesProps<TSearch> = {
  searchType: SearchTypeConfig<TSearch>;
  handleSearchChange: (value: string | number) => void;
  searchMaxLength: number;
  searchValue: string;
  searchPlaceholderOptions?: Record<string, string>;
  defaultPlaceholder: string;
};

type SearchTypeSelectProps<TSearch> = BaseSearchTypesProps & {
  searchType: OptionType[] | SearchTypeConfig<TSearch>;
};

const SearchTypesFixedSelect = ({
  searchType,
  currentPage,
  handleSearchChange,
  searchPlaceholderOptions,
  searchMaxLength,
  searchValue,
  defaultPlaceholder,
  defaultSearchField,
}: FixedSearchTypesProps) => {
  const defaultOptionForSearchField = searchType.find(
    (option) => option.value === searchValue,
  );

  return (
    <SelectContainer
      hasRightBorderRadius={!defaultSearchField}
      isClearable
      id={currentPage ? `table-select-search-${currentPage}` : undefined}
      options={searchType}
      defaultValue={defaultOptionForSearchField}
      placeholder={searchPlaceholderOptions?.[defaultPlaceholder]}
      maxLength={searchMaxLength}
      onChange={(option) => {
        handleSearchChange(option ? (option as OptionType).value : "");
      }}
    />
  );
};

const SearchTypesAsyncSelect = <TSearch,>({
  searchType,
  handleSearchChange,
  searchMaxLength,
  searchValue,
  searchPlaceholderOptions,
  defaultPlaceholder,
}: DynamicSearchTypesProps<TSearch>) => {
  const [selectedOption, setSelectedOption] = useState<SelectOption<TSearch>>();

  const getDefaultValue = async () => {
    if (!searchValue) return;

    const labelKey = searchType.labelKey ?? ("name" as keyof TSearch);
    const valueKey = searchType.valueKey ?? ("id" as keyof TSearch);
    const result = await searchType.getData({
      page: 1,
      pageSize: 1,
      [valueKey]: searchValue,
      ...searchType.extendsQuery,
    });
    const defaultValue = result.data?.results.map((item) => ({
      label: searchType.customItemLabel?.(item) ?? String(item[labelKey]),
      value: searchType.customItemValue?.(item) ?? String(item[valueKey]),
      raw: item,
    }))[0];

    setSelectedOption(defaultValue);
  };

  useEffect(() => {
    getDefaultValue().catch(console.error);
  }, []);

  return (
    <AsyncSelectContainer
      hasRightBorderRadius
      isClearable
      value={selectedOption}
      getData={searchType.getData}
      queryParam={searchType.queryParam}
      extendsQuery={searchType.extendsQuery}
      labelKey={searchType.labelKey}
      valueKey={searchType.valueKey}
      customItemLabel={searchType.customItemLabel}
      customItemValue={searchType.customItemValue}
      placeholder={searchPlaceholderOptions?.[defaultPlaceholder]}
      maxLength={searchMaxLength}
      onChange={(option) => {
        setSelectedOption(option as SelectOption<TSearch>);
        handleSearchChange(option ? (option as OptionType).value : "");
      }}
    />
  );
};

const SearchTypeSelect = <TSearch,>({
  searchType,
  ...rest
}: SearchTypeSelectProps<TSearch>) => {
  if (Array.isArray(searchType)) {
    return <SearchTypesFixedSelect searchType={searchType} {...rest} />;
  }

  return <SearchTypesAsyncSelect searchType={searchType} {...rest} />;
};

export default SearchTypeSelect;
