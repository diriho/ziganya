export type CalendarViewMode = "day" | "week" | "month";

export interface CalendarActivity {
  id: string;
  dateKey: string;
  type: "transaction" | "subscription";
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  status: string;
  /** True for expenses and subscription charges (money out). */
  outflow: boolean;
}
