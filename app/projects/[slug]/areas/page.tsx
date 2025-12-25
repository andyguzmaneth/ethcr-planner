import { MainLayout } from "@/components/layout/main-layout";
import { ProjectAreasClient } from "./project-areas-client";
import { getProjectBySlug, getAreasByProjectId, getTasksByProjectId, getUserById, getUsers } from "@/lib/data-supabase";

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
      const completed = areaTasks.filter((t) => t.status === "completed").length;
      const progress = areaTasks.length > 0 ? Math.round((completed / areaTasks.length) * 100) : 0;
      const leadUser = area.leadId ? await getUserById(area.leadId) : undefined;

      return {
        ...area,
        taskCount: areaTasks.length,
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

  const users = usersList.map((user) => ({
    id: user.id,
    name: user.name,
    initials: user.initials,
    email: user.email,
  }));

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

