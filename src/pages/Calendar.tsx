import { useAuth } from "@sdk/auth";
import { CalendarView } from "@/components/Calendar";

export function CalendarPage() {
  const { user } = useAuth();
  return <CalendarView userId={user?.userID ?? ""} />;
}
