import { MainLayout } from "@/components/layout/main-layout";
import { getTasks, getAreas, getUserById, getProjects } from "@/lib/data-supabase";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const [allTasks, allAreas] = await Promise.all([getTasks(), getAreas()]);

  // Calculate stats (assuming current user ID - in real app, get from auth)
  const currentUserId = "00000000-0000-0000-0000-000000000001"; // Example UUID
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

  // Get areas where user is lead or participant
  const myAreas = allAreas.filter(
    (a) => a.leadId === currentUserId || a.participantIds.includes(currentUserId)
  );

  const projects = await getProjects();

  // Calculate progress for my areas
  const areasWithProgress = await Promise.all(
    myAreas.map(async (area) => {
      const areaTasks = allTasks.filter((t) => t.areaId === area.id);
      const completed = areaTasks.filter((t) => t.status === "completed").length;
      const total = areaTasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      const project = projects.find((p) => p.id === area.projectId);

      return {
        name: area.name,
        projectName: project?.name || "Unknown Project",
        progress,
        completed,
        total,
      };
    })
  );

  // Prepare recent tasks
  const recentTasks = await Promise.all(
    allTasks
      .filter((t) => t.status === "completed" && t.completedAt)
      .sort((a, b) => {
        const dateA = new Date(a.completedAt || 0).getTime();
        const dateB = new Date(b.completedAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(async (task) => {
        const assignee = task.assigneeId ? await getUserById(task.assigneeId) : undefined;
        return {
          id: task.id,
          title: task.title,
          assigneeId: task.assigneeId || null,
          assigneeName: assignee?.name || null,
          completedAt: task.completedAt || "",
        };
      })
  );

  return (
    <MainLayout>
      <DashboardClient
        activeTasksCount={activeTasks.length}
        overdueTasksCount={overdueTasks.length}
        completedTodayCount={completedToday.length}
        upcomingDeadlinesCount={upcomingDeadlines.length}
        recentTasks={recentTasks}
        areasWithProgress={areasWithProgress}
      />
    </MainLayout>
  );
}
