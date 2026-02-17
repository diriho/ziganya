import { CalendarView } from "@/components/Calendar";
import { CURRENT_USER_ID } from "@/lib/constants";

export const CalendarPage = () => <CalendarView userId={CURRENT_USER_ID} />;
