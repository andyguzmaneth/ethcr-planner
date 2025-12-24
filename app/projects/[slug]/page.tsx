import { MainLayout } from "@/components/layout/main-layout";
import { getProjectBySlug, getAreasByProjectId, getTasksByProjectId, getUserById, getUsers } from "@/lib/data";
import { ProjectDetailClient } from "./project-detail-client";
import { createServerTranslationFunction } from "@/lib/i18n";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const t = createServerTranslationFunction();

  const project = getProjectBySlug(slug);
  if (!project) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>{t("projectDetail.notFound")}</p>
        </div>
      </MainLayout>
    );
  }

  const areas = getAreasByProjectId(project.id);
  const allTasks = getTasksByProjectId(project.id);

  // Calculate stats for areas
  const areasWithStats = areas.map((area) => {
    const areaTasks = allTasks.filter((t) => t.areaId === area.id);
    const completed = areaTasks.filter((t) => t.status === "completed").length;
    const lead = getUserById(area.leadId);
    return {
      id: area.id,
      name: area.name,
      leadId: area.leadId,
      leadName: lead?.name || null,
      taskCount: areaTasks.length,
      completed,
    };
  });

  const totalTasks = allTasks.length;
  const totalCompleted = allTasks.filter((t) => t.status === "completed").length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const users = getUsers().map((user) => ({
    id: user.id,
    name: user.name,
    initials: user.initials,
    email: user.email,
  }));

  return (
    <MainLayout>
      <ProjectDetailClient
        project={{
          id: project.id,
          name: project.name,
          type: project.type,
          status: project.status,
        }}
        areasWithStats={areasWithStats}
        totalAreas={areas.length}
        totalTasks={totalTasks}
        completionPercentage={completionPercentage}
        users={users}
        areas={areas.map(a => ({ id: a.id, name: a.name }))}
      />
    </MainLayout>
  );
}
