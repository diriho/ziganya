export type CalendarView = "day" | "week" | "month";

export type CalendarActivity = {
  id: string;
  dateKey: string;
  type: "transaction" | "subscription";
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  status: string;
};
