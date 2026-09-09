import { Search, X } from "lucide-react";
import type { Category } from "@sdk/db";
import { Segmented, Select, cn } from "@/components/ui";
import { DATE_PRESET_LABELS, type DatePreset, type TypeFilter } from "./types";

export interface TransactionFiltersProps {
  typeFilter: TypeFilter;
  onTypeChange: (value: TypeFilter) => void;
  datePreset: DatePreset;
  onDateChange: (value: DatePreset) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  className?: string;
}

export function TransactionFilters({
  typeFilter,
  onTypeChange,
  datePreset,
  onDateChange,
  searchQuery,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
  className,
}: TransactionFiltersProps) {
  return (
    <div className={cn("flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Segmented<DatePreset>
          ariaLabel="Date range"
          value={datePreset}
          onChange={onDateChange}
          options={(Object.keys(DATE_PRESET_LABELS) as DatePreset[]).map((v) => ({ value: v, label: DATE_PRESET_LABELS[v] }))}
        />
        <Segmented<TypeFilter>
          ariaLabel="Transaction type"
          value={typeFilter}
          onChange={onTypeChange}
          options={[
            { value: "all", label: "All" },
            { value: "income", label: "Income" },
            { value: "expense", label: "Expenses" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={categoryId} onChange={(e) => onCategoryChange(e.target.value)} aria-label="Category" className="h-10 sm:w-44">
          <option value="">All categories</option>
          <option value="__none">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <div className="relative sm:w-64">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search merchant, note, amount…"
            aria-label="Search transactions"
            className="field h-10 pl-10 pr-9"
          />
          {searchQuery && (
            <button type="button" onClick={() => onSearchChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-surface-2 hover:text-ink" aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
