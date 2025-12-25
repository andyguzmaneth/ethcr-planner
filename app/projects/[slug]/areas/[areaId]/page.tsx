import { MainLayout } from "@/components/layout/main-layout";
import { AreaTasksClient } from "./area-tasks-client";
import { 
  getProjectBySlug, 
  getAreaById, 
  getTasksByAreaId, 
  getAreasByProjectId,
  getUsers
} from "@/lib/data-supabase";
import { mapUsersForClient, getUserIfProvided } from "@/lib/utils/server-helpers";

interface AreaDetailPageProps {
  params: Promise<{ slug: string; areaId: string }>;
}

export default async function AreaDetailPage({ params }: AreaDetailPageProps) {
  const { slug, areaId } = await params;

  const project = await getProjectBySlug(slug);
  if (!project) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>Proyecto no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const area = await getAreaById(areaId);
  if (!area || area.projectId !== project.id) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>Área no encontrada</p>
        </div>
      </MainLayout>
    );
  }

  const [tasks, lead, areas, usersList] = await Promise.all([
    getTasksByAreaId(areaId),
    getUserIfProvided(area.leadId),
    getAreasByProjectId(project.id),
    getUsers(),
  ]);

  // Enrich tasks with details
  const tasksWithDetails = await Promise.all(
    tasks.map(async (task) => {
      const user = await getUserIfProvided(task.assigneeId);
      const assignee = user ? { id: user.id, name: user.name, initials: user.initials } : null;

      return {
        ...task,
        assignee,
      };
    })
  );

  const users = mapUsersForClient(usersList);

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{area.name}</h1>
          {area.description && (
            <p className="text-muted-foreground text-lg">{area.description}</p>
          )}
          {lead && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Líder:</span>
              <span className="text-sm font-medium">{lead.name}</span>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <AreaTasksClient 
          projectId={project.id}
          projectName={project.name}
          areaId={area.id}
          areaName={area.name}
          areas={areas.map(a => ({ id: a.id, name: a.name }))}
          users={users}
          tasks={tasksWithDetails}
        />
      </div>
    </MainLayout>
  );
}

