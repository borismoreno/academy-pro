import { useState, useEffect, useMemo } from "react";
import { Search, SearchX, Check, ChevronDown, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isDesktop;
}

function SkeletonRow() {
  return (
    <div className="py-3 px-2 flex items-start gap-3 border-b border-outline-variant/10 last:border-0 min-h-12">
      <div className="flex-1 flex flex-col gap-1.5 justify-center">
        <div className="h-3.5 w-2/3 bg-surface-highest rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-surface-highest rounded animate-pulse" />
      </div>
    </div>
  );
}

interface OptionListProps {
  options: SearchableSelectOption[];
  value: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (val: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  listClassName: string;
  inputWrapperClassName: string;
  preventAutoFocus?: boolean;
}

function OptionList({
  options,
  value,
  searchQuery,
  onSearchChange,
  onSelect,
  searchPlaceholder = "Buscar...",
  isLoading,
  listClassName,
  inputWrapperClassName,
  preventAutoFocus,
}: OptionListProps) {
  const [isReadOnly, setIsReadOnly] = useState(() => preventAutoFocus ?? false);

  useEffect(() => {
    if (preventAutoFocus) {
      const timer = setTimeout(() => {
        setIsReadOnly(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [preventAutoFocus]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return options
      .filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          (o.subtitle != null && o.subtitle.toLowerCase().includes(q)),
      )
      .slice(0, 50);
  }, [options, searchQuery]);

  return (
    <>
      {/* Search input */}
      <div className={cn("relative", inputWrapperClassName)}>
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
        />
        <input
          type="text"
          inputMode="search"
          readOnly={isReadOnly}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-surface-highest border-none rounded-xl pl-9 pr-9 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Option list */}
      <div className={listClassName}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-on-surface-variant">
            <SearchX size={24} />
            <p className="font-body text-sm">No se encontraron resultados</p>
          </div>
        ) : (
          filtered.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={cn(
                  "w-full min-h-12 py-3 px-2 flex items-start gap-3 border-b border-outline-variant/10 last:border-0 text-left transition-colors rounded-xl",
                  isSelected
                    ? "bg-surface-highest"
                    : "hover:bg-surface-highest/50",
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-on-surface">
                    {option.label}
                  </p>
                  {option.subtitle && (
                    <p className="font-body text-sm text-on-surface-variant mt-0.5">
                      {option.subtitle}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <Check size={16} className="shrink-0 mt-0.5 text-primary" />
                )}
              </button>
            );
          })
        )}
      </div>
    </>
  );
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  isLoading,
  disabled,
  className,
}: SearchableSelectProps) {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedLabel = options.find((o) => o.value === value)?.label;

  function handleSelect(val: string) {
    onValueChange(val);
    setOpen(false);
    setSearchQuery("");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setSearchQuery("");
  }

  function handleSheetOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setSearchQuery("");
  }

  const triggerButton = (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 flex items-center justify-between font-body text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      <span
        className={
          selectedLabel ? "text-on-surface" : "text-on-surface-variant"
        }
      >
        {selectedLabel ?? placeholder}
      </span>
      <ChevronDown size={16} className="text-on-surface-variant shrink-0" />
    </button>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-surface-high border border-outline-variant/15 rounded-2xl shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <OptionList
            options={options}
            value={value}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={handleSelect}
            searchPlaceholder={searchPlaceholder}
            isLoading={isLoading}
            inputWrapperClassName="px-3 pt-3 pb-2"
            listClassName="max-h-64 overflow-y-auto px-2 pb-2"
            preventAutoFocus={false}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>{triggerButton}</SheetTrigger>
      <SheetContent className="max-h-[80vh] flex flex-col border-none p-0">
        <OptionList
          options={options}
          value={value}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={handleSelect}
          searchPlaceholder={searchPlaceholder}
          isLoading={isLoading}
          inputWrapperClassName="px-4 pb-3"
          listClassName="flex-1 overflow-y-auto px-4 pb-6"
          preventAutoFocus={true}
        />
      </SheetContent>
    </Sheet>
  );
}
