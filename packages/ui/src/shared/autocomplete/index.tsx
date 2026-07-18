"use client";

import { useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { debounce } from "@workspace/ui/lib/utils";

export interface AutoCompleteOption {
  value: string;
  label: string;
  [key: string]: any;
}

export interface AutoCompleteProps {
  options?: AutoCompleteOption[];
  value?: string;
  onChange?: (value: string, option?: AutoCompleteOption) => void;
  onSearch?: (query: string) => Promise<AutoCompleteOption[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  triggerClassName?: string;
  debounceMs?: number;
  /** Custom render function for each option item */
  renderOption?: (option: AutoCompleteOption, isSelected: boolean) => ReactNode;
  /** Custom render for the trigger/selected value */
  renderTrigger?: (option: AutoCompleteOption | undefined) => ReactNode;
}

export function AutoComplete({
  options: staticOptions,
  value,
  onChange,
  onSearch,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  loading: externalLoading,
  disabled = false,
  clearable = true,
  className,
  triggerClassName,
  debounceMs = 300,
  renderOption,
  renderTrigger,
}: AutoCompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dynamicOptions, setDynamicOptions] = useState<AutoCompleteOption[]>(
    [],
  );
  const [internalLoading, setInternalLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const isSearchable = !!onSearch;
  const options = isSearchable ? dynamicOptions : staticOptions || [];
  const loading =
    externalLoading !== undefined ? externalLoading : internalLoading;

  // Find selected option from ALL available options (static + dynamic)
  const allOptions = isSearchable ? dynamicOptions : staticOptions || [];
  const selectedOption = allOptions.find((opt) => opt.value === value);

  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (!onSearch) return;
      setInternalLoading(true);
      try {
        const result = await onSearch(query);
        setDynamicOptions(result || []);
      } catch {
        setDynamicOptions([]);
      } finally {
        setInternalLoading(false);
      }
    }, debounceMs),
  ).current;

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setHasSearched(true);
      if (isSearchable) {
        debouncedSearch(query);
      }
    },
    [isSearchable, debouncedSearch],
  );

  const handleSelect = useCallback(
    (currentValue: string) => {
      const option = allOptions.find((opt) => opt.value === currentValue);
      if (currentValue === value && clearable) {
        onChange?.("", undefined);
        setSearchQuery("");
      } else {
        onChange?.(currentValue, option);
        setSearchQuery("");
      }
      setHasSearched(false);
      setOpen(false);
    },
    [value, clearable, onChange, allOptions],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.("", undefined);
      setSearchQuery("");
      setHasSearched(false);
      setDynamicOptions([]);
    },
    [onChange],
  );

  // Fetch initial options when opened (for searchable mode)
  useEffect(() => {
    if (open && isSearchable && onSearch && !hasSearched) {
      setInternalLoading(true);
      onSearch("")
        .then((result) => {
          setDynamicOptions(result || []);
        })
        .catch(() => {
          setDynamicOptions([]);
        })
        .finally(() => {
          setInternalLoading(false);
        });
    }
  }, [open, isSearchable, onSearch, hasSearched]);

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setHasSearched(false);
    }
  }, [open]);

  // Filter static options when typing
  const filteredOptions = !isSearchable
    ? (staticOptions || []).filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  const showEmpty = hasSearched && !loading && filteredOptions.length === 0;
  const showLoading =
    loading && (!hasSearched || (hasSearched && filteredOptions.length === 0));

  // Default render for option items
  const defaultRenderOption = (
    option: AutoCompleteOption,
    isSelected: boolean,
  ) => (
    <>
      <Check
        className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
      />
      {option.label}
    </>
  );

  // Default render for trigger
  const defaultRenderTrigger = (option: AutoCompleteOption | undefined) => (
    <span className="truncate">{option ? option.label : placeholder}</span>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedOption && "text-muted-foreground",
            triggerClassName,
          )}
        >
          {renderTrigger
            ? renderTrigger(selectedOption)
            : defaultRenderTrigger(selectedOption)}
          <div className="flex items-center gap-1 ml-2">
            {clearable && selectedOption && !disabled && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0", className)}
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {showLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {showEmpty && !loading && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            {!loading && filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                  >
                    {renderOption
                      ? renderOption(option, value === option.value)
                      : defaultRenderOption(option, value === option.value)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
