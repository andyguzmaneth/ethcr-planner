import { MainLayout } from "@/components/layout/main-layout";
import { getProjects, getAreas, getTasks, isUserJoinedProject } from "@/lib/data-supabase";
import { ProjectsClient } from "./projects-client";

// TODO: For now, we'll use a hardcoded user ID. In a real app, get from auth session
const CURRENT_USER_ID = "00000000-0000-0000-0000-000000000001"; // Example UUID

export default async function ProjectsPage() {
  const [projects, allAreas, allTasks] = await Promise.all([
    getProjects(),
    getAreas(),
    getTasks(),
  ]);

  // Calculate stats for each project
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const projectAreas = allAreas.filter((a) => a.projectId === project.id);
      const projectTasks = allTasks.filter((t) => t.projectId === project.id);
      const completedTasks = projectTasks.filter((t) => t.status === "completed").length;
      const isJoined = await isUserJoinedProject(project.id, CURRENT_USER_ID);

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
