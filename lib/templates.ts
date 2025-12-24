import type {
  ProjectTemplate,
  TemplateArea,
  TemplateResponsibility,
  TemplateTask,
  RawTemplateArea,
  TaskStatus,
  ProjectType,
  Project,
  Area,
  Responsibility,
  Task,
  User,
} from "./types";
import {
  createProject,
  createArea,
  createResponsibility,
  createTask,
  getUsers,
  createUser
} from "./data";

/**
 * Maps template estado to TaskStatus
 */
function mapEstadoToStatus(estado?: string): TaskStatus {
  switch (estado) {
    case "Done":
      return "completed";
    case "In Progress":
      return "in_progress";
    case "Not Started":
    default:
      return "pending";
  }
}

/**
 * Finds or creates a user from a template team member
 * Returns the user ID or undefined if name doesn't match
 */
function findOrCreateUser(
  teamMember: { name: string; email?: string; handle?: string; wallet?: string },
  existingUsers: User[]
): string {
  // Try to find by email first
  if (teamMember.email) {
    const byEmail = existingUsers.find((u) => u.email === teamMember.email);
    if (byEmail) return byEmail.id;
  }

  // Try to find by name (case insensitive)
  const byName = existingUsers.find(
    (u) => u.name.toLowerCase() === teamMember.name.toLowerCase()
  );
  if (byName) return byName.id;

  // Create new user
  const initials = teamMember.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const newUser = createUser({
    name: teamMember.name,
    email: teamMember.email || `${teamMember.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    initials,
    handle: teamMember.handle,
    wallet: teamMember.wallet,
  });

  return newUser.id;
}

/**
 * Converts raw JSON structure to ProjectTemplate format
 */
export function convertRawTemplateToProjectTemplate(
  templateName: string,
  projectType: ProjectType,
  rawAreas: Record<string, RawTemplateArea>
): ProjectTemplate {
  const areas: TemplateArea[] = Object.entries(rawAreas).map(
    ([areaName, areaData]) => {
      // Convert Responsabilidades array to TemplateResponsibility objects
      const responsibilities: TemplateResponsibility[] = [];

      if (areaData.Responsabilidades && areaData.Responsabilidades.length > 0) {
        // Create one responsibility per responsibility name, with all tasks
        // This is a simplified approach - in the future we could add task-to-responsibility mapping
        areaData.Responsabilidades.forEach((respName) => {
          const responsibility: TemplateResponsibility = {
            name: respName,
            tasks: areaData.Tareas.map((tarea): TemplateTask => ({
              title: tarea.tarea,
              estado: tarea.estado,
              etapa: tarea.etapa,
              notes: tarea.notes,
            })),
          };
          responsibilities.push(responsibility);
        });
      } else {
        // No responsibilities defined, create a default one with all tasks
        const defaultResponsibility: TemplateResponsibility = {
          name: "Tareas",
          tasks: areaData.Tareas.map((tarea): TemplateTask => ({
            title: tarea.tarea,
            estado: tarea.estado,
            etapa: tarea.etapa,
            notes: tarea.notes,
          })),
        };
        responsibilities.push(defaultResponsibility);
      }

      const area: TemplateArea = {
        name: areaName,
        team: areaData.Equipo,
        responsibilities,
        sections: areaData.Secciones,
      };

      return area;
    }
  );

  return {
    id: `template-${Date.now()}`,
    name: templateName,
    projectType,
    areas,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Legacy alias
export const convertRawTemplateToEventTemplate = convertRawTemplateToProjectTemplate;

/**
 * Initializes a project from a template
 * Creates Project, Areas, Responsibilities, and Tasks
 */
export function initializeProjectFromTemplate(
  template: ProjectTemplate,
  projectDetails: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  },
  options?: {
    assignTeamMembers?: boolean; // Whether to assign team members to areas
    defaultTaskStatus?: TaskStatus; // Override default status for tasks
  }
): {
  project: Project;
  areas: Area[];
  responsibilities: Responsibility[];
  tasks: Task[];
} {
  const { assignTeamMembers = true, defaultTaskStatus } = options || {};

  // Create the project
  const project = createProject({
    name: projectDetails.name,
    type: template.projectType,
    status: "In Planning",
    description: projectDetails.description,
    startDate: projectDetails.startDate,
    endDate: projectDetails.endDate,
  });

  const allUsers = getUsers();
  const areas: Area[] = [];
  const responsibilities: Responsibility[] = [];
  const tasks: Task[] = [];

  // Process each area in the template
  for (const templateArea of template.areas) {
    // Find or create team members for this area
    let leadId: string | undefined;
    const participantIds: string[] = [];

    if (assignTeamMembers && templateArea.team && templateArea.team.length > 0) {
      // First team member becomes the lead
      leadId = findOrCreateUser(templateArea.team[0], allUsers);

      // Rest become participants
      for (let i = 1; i < templateArea.team.length; i++) {
        const participantId = findOrCreateUser(templateArea.team[i], allUsers);
        participantIds.push(participantId);
      }
    }

    // Create the area
    const area = createArea({
      projectId: project.id,
      name: templateArea.name,
      description: templateArea.description,
      leadId: leadId || allUsers[0]?.id || "", // Fallback to first user or empty
      participantIds,
    });
    areas.push(area);

    // Process responsibilities and tasks
    for (const templateResponsibility of templateArea.responsibilities) {
      const responsibility = createResponsibility({
        areaId: area.id,
        name: templateResponsibility.name,
        description: templateResponsibility.description,
      });
      responsibilities.push(responsibility);

      // Create tasks for this responsibility
      for (const templateTask of templateResponsibility.tasks) {
        // Determine task status
        const status =
          defaultTaskStatus || mapEstadoToStatus(templateTask.estado);

        // Combine description and notes
        const description = templateTask.description
          ? templateTask.notes
            ? `${templateTask.description}\n\n${templateTask.notes}`
            : templateTask.description
          : templateTask.notes || undefined;

        const task = createTask({
          areaId: area.id,
          projectId: project.id,
          title: templateTask.title,
          description,
          status,
          supportResources: templateTask.supportResources,
          templateId: template.id,
        });
        tasks.push(task);
      }
    }
  }

  return {
    project,
    areas,
    responsibilities,
    tasks,
  };
}

// Legacy alias
export const initializeEventFromTemplate = initializeProjectFromTemplate;

/**
 * Loads a template from a JSON file structure
 * Expected format: { "Project Name": { "Areas": { "Area Name": RawTemplateArea, ... } } }
 */
export function loadTemplateFromJson(
  jsonData: Record<string, { Areas?: Record<string, RawTemplateArea> }>,
  projectType: ProjectType = "Conference"
): ProjectTemplate[] {
  const templates: ProjectTemplate[] = [];

  for (const [projectName, projectData] of Object.entries(jsonData)) {
    // Check if it has the nested "Areas" structure
    const areas = projectData.Areas || (projectData as unknown as Record<string, RawTemplateArea>);

    const template = convertRawTemplateToProjectTemplate(
      projectName,
      projectType,
      areas
    );
    templates.push(template);
  }

  return templates;
}

