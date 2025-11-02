import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { getTasks, getTracks, getUserById, getEvents } from "@/lib/data";

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

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
          <p className="text-muted-foreground mt-2">
            ¡Bienvenido de vuelta! Aquí está lo que sucede con tus eventos.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Tareas</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTasks.length}</div>
              <p className="text-xs text-muted-foreground">Tareas activas asignadas a ti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueTasks.length}</div>
              <p className="text-xs text-muted-foreground">Tareas pasadas de fecha límite</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedToday.length}</div>
              <p className="text-xs text-muted-foreground">Tareas completadas hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas Fechas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingDeadlines.length}</div>
              <p className="text-xs text-muted-foreground">Tareas para esta semana</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas actualizaciones de tus eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allTasks
                  .filter((t) => t.status === "completed" && t.completedAt)
                  .sort((a, b) => {
                    const dateA = new Date(a.completedAt || 0).getTime();
                    const dateB = new Date(b.completedAt || 0).getTime();
                    return dateB - dateA;
                  })
                  .slice(0, 5)
                  .map((task) => {
                    const assignee = getUserById(task.assigneeId || "");
                    const timeAgo = task.completedAt
                      ? getTimeAgo(new Date(task.completedAt))
                      : "";

                    return (
                      <div key={task.id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium">Tarea completada</p>
                          <p className="text-sm text-muted-foreground">
                            &ldquo;{task.title}&rdquo; marcada como completada por{" "}
                            {assignee?.name || "Usuario desconocido"}
                          </p>
                          <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Mis Tracks</CardTitle>
              <CardDescription>Tracks que lideras o en los que participas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracksWithProgress.slice(0, 5).map((track, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-sm font-medium">{track.name}</p>
                    <p className="text-xs text-muted-foreground">{track.eventName}</p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${track.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Hace menos de un minuto";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `Hace ${days} ${days === 1 ? "día" : "días"}`;
}
