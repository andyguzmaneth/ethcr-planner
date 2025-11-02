import type {
  EventTemplate,
  TemplateTrack,
  TemplateResponsibility,
  TemplateTask,
  RawTemplateArea,
  TaskStatus,
  EventType,
  Event,
  Track,
  Responsibility,
  Task,
  User,
} from "./types";
import {
  createEvent,
  createTrack,
  createResponsibility,
  createTask,
  getUsers,
  createUser,
  getUserById,
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
 * Converts raw JSON structure to EventTemplate format
 */
export function convertRawTemplateToEventTemplate(
  templateName: string,
  eventType: EventType,
  rawAreas: Record<string, RawTemplateArea>
): EventTemplate {
  const tracks: TemplateTrack[] = Object.entries(rawAreas).map(
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

      const track: TemplateTrack = {
        name: areaName,
        team: areaData.Equipo,
        responsibilities,
        sections: areaData.Secciones,
      };

      return track;
    }
  );

  return {
    id: `template-${Date.now()}`,
    name: templateName,
    eventType,
    tracks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Initializes an event from a template
 * Creates Event, Tracks, Responsibilities, and Tasks
 */
export function initializeEventFromTemplate(
  template: EventTemplate,
  eventDetails: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  },
  options?: {
    assignTeamMembers?: boolean; // Whether to assign team members to tracks
    defaultTaskStatus?: TaskStatus; // Override default status for tasks
  }
): {
  event: Event;
  tracks: Track[];
  responsibilities: Responsibility[];
  tasks: Task[];
} {
  const { assignTeamMembers = true, defaultTaskStatus } = options || {};

  // Create the event
  const event = createEvent({
    name: eventDetails.name,
    type: template.eventType,
    status: "In Planning",
    description: eventDetails.description,
    startDate: eventDetails.startDate,
    endDate: eventDetails.endDate,
  });

  const allUsers = getUsers();
  const tracks: Track[] = [];
  const responsibilities: Responsibility[] = [];
  const tasks: Task[] = [];

  // Process each track in the template
  for (const templateTrack of template.tracks) {
    // Find or create team members for this track
    let leadId: string | undefined;
    const participantIds: string[] = [];

    if (assignTeamMembers && templateTrack.team && templateTrack.team.length > 0) {
      // First team member becomes the lead
      leadId = findOrCreateUser(templateTrack.team[0], allUsers);

      // Rest become participants
      for (let i = 1; i < templateTrack.team.length; i++) {
        const participantId = findOrCreateUser(templateTrack.team[i], allUsers);
        participantIds.push(participantId);
      }
    }

    // Create the track
    const track = createTrack({
      eventId: event.id,
      name: templateTrack.name,
      description: templateTrack.description,
      leadId: leadId || allUsers[0]?.id || "", // Fallback to first user or empty
      participantIds,
    });
    tracks.push(track);

    // Process responsibilities and tasks
    for (const templateResponsibility of templateTrack.responsibilities) {
      const responsibility = createResponsibility({
        trackId: track.id,
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
          responsibilityId: responsibility.id,
          trackId: track.id,
          eventId: event.id,
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
    event,
    tracks,
    responsibilities,
    tasks,
  };
}

/**
 * Loads a template from a JSON file structure
 * Expected format: { "Event Name": { "Areas": { "Area Name": RawTemplateArea, ... } } }
 */
export function loadTemplateFromJson(
  jsonData: Record<string, { Areas?: Record<string, RawTemplateArea> }>,
  eventType: EventType = "Conference"
): EventTemplate[] {
  const templates: EventTemplate[] = [];

  for (const [eventName, eventData] of Object.entries(jsonData)) {
    // Check if it has the nested "Areas" structure
    const areas = eventData.Areas || (eventData as unknown as Record<string, RawTemplateArea>);
    
    const template = convertRawTemplateToEventTemplate(
      eventName,
      eventType,
      areas
    );
    templates.push(template);
  }

  return templates;
}

