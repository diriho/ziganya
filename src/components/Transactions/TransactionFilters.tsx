import type { TypeFilter } from "./types";

const options: { label: string; value: TypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expenses", value: "expense" },
];

export interface TransactionFiltersProps {
  typeFilter: TypeFilter;
  onFilterChange: (value: TypeFilter) => void;
}

export const TransactionFilters = ({
  typeFilter,
  onFilterChange,
}: TransactionFiltersProps) => (
  <div
    className="flex gap-2 overflow-x-auto rounded-3xl bg-zinc-50/70 p-4 sm:flex-wrap sm:overflow-visible"
    style={{ scrollbarWidth: "none" }}
  >
    {options.map(({ label, value }) => {
      const isActive = typeFilter === value;

      return (
        <button
          key={value}
          type="button"
          onClick={() => onFilterChange(value)}
          className={`min-w-[7rem] shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition-colors shadow-sm sm:min-w-0 ${
            isActive
              ? "bg-brand-green text-white"
              : "bg-white/80 text-zinc-600 ring-1 ring-inset ring-zinc-200"
          }`}
          aria-pressed={isActive}
        >
          {label}
        </button>
      );
    })}
  </div>
);
