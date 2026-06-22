import { Input } from "@common/components/ui/input";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import { ClearContent, Search } from "@common/components/icons";

import React, {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type AutocompleteInputProps = {
  id?: string;
  options: string[];
  placeholder?: string;
  debounce?: number;
  noResultsMessage?: string;
  onSearch: (searchText: string) => void;
};

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id,
  options,
  placeholder,
  debounce = 200,
  noResultsMessage,
  onSearch,
}) => {
  const { t } = useLayoutStore((state) => state);

  const [inputValue, setInputValue] = useState<string>("");
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedIndex]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [ref]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const filtered: string[] = options.filter((option) =>
        option.toLowerCase().includes(inputValue.trim().toLowerCase()),
      );
      setFilteredOptions(filtered);
      setFocusedIndex(-1);
    }, debounce);

    return () => {
      clearTimeout(timeout);
    };
  }, [inputValue, options]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      setShowDropdown(true);
    }
    setInputValue(e.target.value);
    if (e.target.value.trim()) return;
    setFocusedIndex(-1);
    setShowDropdown(false);
  };

  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    onSearch(option);
    setShowDropdown(false);
    setFocusedIndex(-1);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredOptions.length) return;

    const lastIndex = filteredOptions.length - 1;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1 > lastIndex ? 0 : prev + 1));
        break;

      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? lastIndex : prev - 1));
        break;

      case "Tab":
        if (showDropdown) {
          e.preventDefault();

          setFocusedIndex((prev) => {
            if (e.shiftKey) {
              return prev <= 0 ? lastIndex : prev - 1;
            }
            return prev >= lastIndex ? 0 : prev + 1;
          });
        }
        break;

      case "Enter":
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          e.preventDefault();
          const selected = filteredOptions[focusedIndex];
          if (selected !== undefined) {
            handleOptionSelect(selected);
          }
        } else {
          handleOptionSelect(inputValue.trim());
        }
        break;

      default:
        break;
    }
  };

  return (
    <div ref={ref} className="group/autocomplete-input relative">
      <Input
        className="pr-14"
        id={id}
        maxLength={255}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      />
      {showDropdown && !!inputValue.trim().length && (
        <ul className="scrollbar absolute left-0 right-0 top-[100%] z-50 mt-2 max-h-40 overflow-y-auto rounded bg-neutral-0 text-base shadow dark:bg-neutral-dark-300">
          {filteredOptions.length ? (
            filteredOptions.map((option, index) => (
              <button
                key={option}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={`block w-full cursor-pointer break-all p-2 text-left hover:bg-neutral-50 focus-visible:bg-neutral-50 hover:dark:bg-neutral-dark-100 ${
                  index === focusedIndex
                    ? "bg-neutral-100 dark:bg-neutral-dark-100"
                    : ""
                }`}
                onClick={() => {
                  handleOptionSelect(option);
                }}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="p-2 text-center">{noResultsMessage}</div>
          )}
        </ul>
      )}
      <div className="absolute right-2 top-1/2 z-10 flex h-5 -translate-y-1/2 items-center justify-center gap-1 text-neutral-500 dark:text-neutral-dark-500">
        {!!inputValue.length && (
          <TooltipContainer
            content={t("common.actions.delete")}
            disableHoverableContent={true}
          >
            <span className="hidden group-hover/autocomplete-input:block group-has-[input:focus]/autocomplete-input:block">
              <ClearContent
                onClick={() => {
                  handleOptionSelect("");
                }}
              />
            </span>
          </TooltipContainer>
        )}
        <Search className="text-neutral-700" />
      </div>
    </div>
  );
};

export default AutocompleteInput;
