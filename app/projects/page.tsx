import { MainLayout } from "@/components/layout/main-layout";
import { getProjects, getAreas, getTasks, isUserJoinedProject } from "@/lib/data";
import { ProjectsClient } from "./projects-client";

// TODO: For now, we'll use a hardcoded user ID. In a real app, get from auth session
const CURRENT_USER_ID = "user-alfredo";

export default function ProjectsPage() {
  const projects = getProjects();
  const allAreas = getAreas();
  const allTasks = getTasks();

  // Calculate stats for each project
  const projectsWithStats = projects.map((project) => {
    const projectAreas = allAreas.filter((a) => a.projectId === project.id || (a.eventId && a.eventId === project.id));
    const projectTasks = allTasks.filter((t) => t.projectId === project.id || (t.eventId && t.eventId === project.id));
    const completedTasks = projectTasks.filter((t) => t.status === "completed").length;
    const isJoined = isUserJoinedProject(project.id, CURRENT_USER_ID);

    return {
      ...project,
      areaCount: projectAreas.length,
      taskCount: projectTasks.length,
      completedTasks,
      isJoined,
    };
  });

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <ProjectsClient projects={projectsWithStats} />
      </div>
    </MainLayout>
  );
}
