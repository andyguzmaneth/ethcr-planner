import { MainLayout } from "@/components/layout/main-layout";
import { getProjectBySlug, getAreasByProjectId, getTasksByProjectId, getUsers } from "@/lib/data-supabase";
import { ProjectDetailClient } from "./project-detail-client";
import { createServerTranslationFunction } from "@/lib/i18n";
import { mapUsersForClient, getUserIfProvided, calculateTaskStats, getTaskStatusColors, getTaskStatusLabels, enrichTasksWithDetails } from "@/lib/utils/server-helpers";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const t = createServerTranslationFunction();

  const project = await getProjectBySlug(slug);
  if (!project) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>{t("projectDetail.notFound")}</p>
        </div>
      </MainLayout>
    );
  }

  const [areas, allTasks, usersList] = await Promise.all([
    getAreasByProjectId(project.id),
    getTasksByProjectId(project.id),
    getUsers(),
  ]);

  // Calculate stats for areas
  const areasWithStats = await Promise.all(
    areas.map(async (area) => {
      const areaTasks = allTasks.filter((t) => t.areaId === area.id);
      const { total, completed } = calculateTaskStats(areaTasks);
      const lead = await getUserIfProvided(area.leadId);
      return {
        id: area.id,
        name: area.name,
        leadId: area.leadId,
        leadName: lead?.name || null,
        taskCount: total,
        completed,
      };
    })
  );

  const { total: totalTasks, progress: completionPercentage } = calculateTaskStats(allTasks);
  const users = mapUsersForClient(usersList);

  const statusColors = getTaskStatusColors();
  const statusLabels = getTaskStatusLabels();
  const tasksWithDetails = await enrichTasksWithDetails(allTasks);

  return (
    <MainLayout>
      <ProjectDetailClient
        project={{
          id: project.id,
          name: project.name,
          type: project.type,
          status: project.status,
        }}
        projectSlug={slug}
        areasWithStats={areasWithStats}
        totalAreas={areas.length}
        totalTasks={totalTasks}
        completionPercentage={completionPercentage}
        users={users}
        areas={areas.map(a => ({ id: a.id, name: a.name }))}
        tasks={tasksWithDetails}
        statusColors={statusColors}
        statusLabels={statusLabels}
      />
    </MainLayout>
  );
}
