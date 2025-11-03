import { MainLayout } from "@/components/layout/main-layout";
import { getEvents, getAreas, getTasks, isUserJoinedEvent } from "@/lib/data";
import { EventsClient } from "./events-client";

// TODO: For now, we'll use a hardcoded user ID. In a real app, get from auth session
const CURRENT_USER_ID = "user-alfredo";

export default function EventsPage() {
  const events = getEvents();
  const allAreas = getAreas();
  const allTasks = getTasks();

  // Calculate stats for each event
  const eventsWithStats = events.map((event) => {
    const eventAreas = allAreas.filter((a) => a.eventId === event.id);
    const eventTasks = allTasks.filter((t) => t.eventId === event.id);
    const completedTasks = eventTasks.filter((t) => t.status === "completed").length;
    const isJoined = isUserJoinedEvent(event.id, CURRENT_USER_ID);

    return {
      ...event,
      areaCount: eventAreas.length,
      taskCount: eventTasks.length,
      completedTasks,
      isJoined,
    };
  });

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <EventsClient events={eventsWithStats} />
      </div>
    </MainLayout>
  );
}
