import { MainLayout } from "@/components/layout/main-layout";
import { getTasks, getProjectById, getAreaById, getProjects, getUsers, getAreas } from "@/lib/data-supabase";
import { createServerTranslationFunction, getLocaleFromCookies } from "@/lib/i18n";
import { cookies } from "next/headers";
import { mapUsersForClient, getUserIfProvided } from "@/lib/utils/server-helpers";
import { TasksPageClient } from "./tasks-page-client";
import { TasksViewClient } from "./tasks-view-client";

export default async function TasksPage() {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("app_locale")?.value;
  const locale = getLocaleFromCookies(localeFromCookie);
  const t = createServerTranslationFunction(locale);

  const [tasks, projects, users, allAreas] = await Promise.all([
    getTasks(),
    getProjects(),
    getUsers(),
    getAreas(),
  ]);

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

  // Enrich tasks with details
  const tasksWithDetails = await Promise.all(
    tasks.map(async (task) => {
      const assignee = await getUserIfProvided(task.assigneeId) ?? null;
      const project = task.projectId ? await getProjectById(task.projectId) : undefined;
      const area = task.areaId ? await getAreaById(task.areaId) : null;

      return {
        ...task,
        assignee,
        project,
        area,
      };
    })
  );

  const mappedUsers = mapUsersForClient(users);

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona y rastrea todas las tareas entre proyectos
            </p>
          </div>
          <TasksPageClient
            projects={projects.map(p => ({ id: p.id, name: p.name }))}
            areas={allAreas.map(a => ({ id: a.id, name: a.name, projectId: a.projectId || "" }))}
            users={mappedUsers}
          />
        </div>

        {/* Tasks Views (List, Kanban, Calendar, Table) */}
        <TasksViewClient
          tasks={tasksWithDetails}
          projects={projects.map(p => ({ id: p.id, name: p.name }))}
          areas={allAreas.map(a => ({ id: a.id, name: a.name, projectId: a.projectId || "" }))}
          users={mappedUsers}
          statusColors={statusColors}
          statusLabels={statusLabels}
        />
      </div>
    </MainLayout>
  );
}
