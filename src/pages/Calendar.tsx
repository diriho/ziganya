import { CalendarView } from "@/components/Calendar";
import { useCurrentUser } from "@sdk/requests";

export const CalendarPage = () => {
	const { user, isLoading } = useCurrentUser();

	if (isLoading || !user?.userID) {
		return <div>Loading...</div>;
	}

	return <CalendarView userId={user.userID} />;
};
