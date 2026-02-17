import { Search } from "lucide-react";
import type { TypeFilter } from "./types";

const options: { label: string; value: TypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expenses", value: "expense" },
];

export interface TransactionFiltersProps {
  typeFilter: TypeFilter;
  onFilterChange: (value: TypeFilter) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export const TransactionFilters = ({
  typeFilter,
  onFilterChange,
  searchQuery = "",
  onSearchChange,
}: TransactionFiltersProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex gap-2">
      {options.map(({ label, value }) => {
        const isActive = typeFilter === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              isActive
                ? "bg-brand-green text-white shadow-sm"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 hover:ring-zinc-300"
            }`}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
    {onSearchChange && (
      <div className="relative w-full sm:w-72">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by merchant..."
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          aria-label="Search transactions by merchant"
        />
      </div>
    )}
  </div>
);
