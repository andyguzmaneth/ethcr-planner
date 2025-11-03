import { MainLayout } from "@/components/layout/main-layout";
import { getTasks, getTracks, getUserById, getEvents } from "@/lib/data";
import { DashboardClient } from "./dashboard-client";

export default function DashboardPage() {
  const allTasks = getTasks();
  const allTracks = getTracks();

  // Calculate stats (assuming current user ID - in real app, get from auth)
  const currentUserId = "user-alfredo"; // TODO: Get from auth session
  const myTasks = allTasks.filter((t) => t.assigneeId === currentUserId);
  const activeTasks = myTasks.filter((t) => t.status !== "completed");
  const overdueTasks = myTasks.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed"
  );
  const completedToday = myTasks.filter((t) => {
    if (t.status !== "completed" || !t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    const today = new Date();
    return (
      completedDate.getDate() === today.getDate() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getFullYear() === today.getFullYear()
    );
  });
  const upcomingDeadlines = myTasks.filter((t) => {
    if (!t.deadline || t.status === "completed") return false;
    const deadline = new Date(t.deadline);
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return deadline >= today && deadline <= nextWeek;
  });

  // Get tracks where user is lead or participant
  const myTracks = allTracks.filter(
    (t) => t.leadId === currentUserId || t.participantIds.includes(currentUserId)
  );

  // Calculate progress for my tracks
  const tracksWithProgress = myTracks.map((track) => {
    const trackTasks = allTasks.filter((t) => t.trackId === track.id);
    const completed = trackTasks.filter((t) => t.status === "completed").length;
    const total = trackTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const event = getEvents().find((e) => e.id === track.eventId);

    return {
      name: track.name,
      eventName: event?.name || "Unknown Event",
      progress,
      completed,
      total,
    };
  });

  // Prepare recent tasks
  const recentTasks = allTasks
    .filter((t) => t.status === "completed" && t.completedAt)
    .sort((a, b) => {
      const dateA = new Date(a.completedAt || 0).getTime();
      const dateB = new Date(b.completedAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5)
    .map((task) => {
      const assignee = getUserById(task.assigneeId || "");
      return {
        id: task.id,
        title: task.title,
        assigneeId: task.assigneeId || null,
        assigneeName: assignee?.name || null,
        completedAt: task.completedAt || "",
      };
    });

  return (
    <MainLayout>
      <DashboardClient
        activeTasksCount={activeTasks.length}
        overdueTasksCount={overdueTasks.length}
        completedTodayCount={completedToday.length}
        upcomingDeadlinesCount={upcomingDeadlines.length}
        recentTasks={recentTasks}
        tracksWithProgress={tracksWithProgress}
      />
    </MainLayout>
  );
}
