import { MainLayout } from "@/components/layout/main-layout";
import { ProjectAreasClient } from "./project-areas-client";
import { getProjectBySlug, getAreasByProjectId, getTasksByProjectId, getUsers } from "@/lib/data-supabase";
import { mapUsersForClient, getUserIfProvided, calculateTaskStats } from "@/lib/utils/server-helpers";

interface ProjectAreasPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectAreasPage({ params }: ProjectAreasPageProps) {
  const { slug } = await params;

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

  const [areas, allTasks, usersList] = await Promise.all([
    getAreasByProjectId(project.id),
    getTasksByProjectId(project.id),
    getUsers(),
  ]);

  // Calculate stats for each area
  const areasWithStats = await Promise.all(
    areas.map(async (area) => {
      const areaTasks = allTasks.filter((t) => t.areaId === area.id);
      const { total, completed, progress } = calculateTaskStats(areaTasks);
      const leadUser = await getUserIfProvided(area.leadId);

      return {
        ...area,
        taskCount: total,
        completed,
        progress,
        lead: leadUser
          ? {
              id: leadUser.id,
              name: leadUser.name,
              initials: leadUser.initials,
            }
          : null,
      };
    })
  );

  const users = mapUsersForClient(usersList);

  return (
    <MainLayout>
      <ProjectAreasClient
        projectId={project.id}
        projectSlug={slug}
        projectName={project.name}
        areasWithStats={areasWithStats}
        users={users}
      />
    </MainLayout>
  );
}

