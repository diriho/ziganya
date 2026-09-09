export type TypeFilter = "all" | "income" | "expense";
export type DatePreset = "month" | "30d" | "90d" | "all";

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  month: "This month",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};
