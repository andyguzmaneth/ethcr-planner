import { MainLayout } from "@/components/layout/main-layout";
import { getProjects, getAreas, getTasks, isUserJoinedProject } from "@/lib/data-supabase";
import { getCurrentUserId } from "@/lib/utils/server-helpers";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const [projects, allAreas, allTasks, currentUserId] = await Promise.all([
    getProjects(),
    getAreas(),
    getTasks(),
    getCurrentUserId(),
  ]);

  // Calculate stats for each project
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const projectAreas = allAreas.filter((a) => a.projectId === project.id);
      const projectTasks = allTasks.filter((t) => t.projectId === project.id);
      const completedTasks = projectTasks.filter((t) => t.status === "completed").length;
      const isJoined = await isUserJoinedProject(project.id, currentUserId);

      return {
        ...project,
        areaCount: projectAreas.length,
        taskCount: projectTasks.length,
        completedTasks,
        isJoined,
      };
    })
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <ProjectsClient projects={projectsWithStats} />
      </div>
    </MainLayout>
  );
}
