import { MainLayout } from "@/components/layout/main-layout";
import { getEventBySlug, getTasksByEventId, getUserById, getAreaById, getAreasByEventId, getUsers } from "@/lib/data";
import { createServerTranslationFunction, getLocaleFromCookies } from "@/lib/i18n";
import { cookies } from "next/headers";
import { EventTasksClient } from "./event-tasks-client";
import { EventTasksViewClient } from "./event-tasks-view-client";

interface EventTasksPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventTasksPage({ params }: EventTasksPageProps) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("app_locale")?.value;
  const locale = getLocaleFromCookies(localeFromCookie);
  const t = createServerTranslationFunction(locale);

  const event = getEventBySlug(slug);
  if (!event) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>Evento no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const tasks = getTasksByEventId(event.id);
  const areas = getAreasByEventId(event.id);
  const users = getUsers();

  const statusColors = {
    pending: "bg-gray-500",
    in_progress: "bg-blue-500",
    blocked: "bg-red-500",
    completed: "bg-green-500",
  };

  const statusLabels = {
    pending: "Pendiente",
    in_progress: "En Progreso",
    blocked: "Bloqueada",
    completed: "Completada",
  };

  // Enrich tasks with user and area info
  const tasksWithDetails = tasks.map((task) => {
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
    const area = task.areaId ? getAreaById(task.areaId) : null;

    return {
      ...task,
      assignee,
      area,
    };
  });

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tareas - {event.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona y rastrea todas las tareas de este evento
            </p>
          </div>
          <EventTasksClient
            eventId={event.id}
            eventName={event.name}
            areas={areas.map(a => ({ id: a.id, name: a.name }))}
            users={users.map(u => ({ id: u.id, name: u.name, initials: u.initials, email: u.email }))}
          />
        </div>

        {/* Tasks Views (List, Kanban, Calendar) */}
        <EventTasksViewClient
          tasks={tasksWithDetails}
          eventId={event.id}
          eventName={event.name}
          areas={areas.map(a => ({ id: a.id, name: a.name }))}
          users={users.map(u => ({ id: u.id, name: u.name, initials: u.initials, email: u.email }))}
          statusColors={statusColors}
          statusLabels={statusLabels}
        />
      </div>
    </MainLayout>
  );
}
