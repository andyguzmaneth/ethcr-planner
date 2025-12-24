// Type definitions for all entities

export type TaskStatus = "pending" | "in_progress" | "blocked" | "completed";
export type ProjectType = "Meetup" | "Conference" | "Property" | "Custom";
export type ProjectStatus = "In Planning" | "Active" | "Completed" | "Cancelled";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

// Legacy aliases for backward compatibility
export type EventType = ProjectType;
export type EventStatus = ProjectStatus;

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  handle?: string;
  wallet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string; // URL-friendly version of the name
  type: ProjectType;
  status: ProjectStatus;
  description?: string;
  startDate?: string;
  endDate?: string; // Optional: Events have end dates, Properties typically don't
  participantIds?: string[]; // User IDs who have joined this project
  createdAt: string;
  updatedAt: string;
}

// Legacy alias for backward compatibility
export type Event = Project;

export interface Area {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  leadId: string; // User ID
  participantIds: string[]; // User IDs
  order?: number; // Display order (lower numbers appear first)
  createdAt: string;
  updatedAt: string;
  eventId?: string; // Deprecated: for backward compatibility during migration
}

export interface Responsibility {
  id: string;
  areaId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  areaId?: string; // Optional - can be empty temporarily
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string; // User ID
  deadline?: string; // ISO date string
  status: TaskStatus;
  supportResources?: string[]; // URLs or text notes
  templateId?: string; // If created from a template

  // Task dependencies
  dependsOn?: string[]; // Array of task IDs this task depends on (blocking tasks)

  // Recurring task support
  isRecurring?: boolean;
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval: number; // Repeat every X days/weeks/months
    endDate?: string; // Optional end date for recurrence
  };

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  eventId?: string; // Deprecated: for backward compatibility during migration
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  date: string; // ISO date string
  time: string; // Time string (e.g., "14:00")
  attendeeIds: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
  eventId?: string; // Deprecated: for backward compatibility during migration
}

export interface MeetingNote {
  id: string;
  meetingId: string;
  content: string; // Rich text or markdown
  agenda?: string;
  decisions?: string;
  actionItems?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export type TaskEstado = "Not Started" | "In Progress" | "Done";
export type TaskEtapa = 
  | "< 1 semana"
  | "< 2 semanas"
  | "< 3 semanas"
  | "> 1 mes"
  | "> 2 meses"
  | "> 3 meses"
  | "> 4 meses"
  | "> 5 meses"
  | "> 6 meses"
  | "> 7 meses"
  | "última semana"
  | string; // Allow custom stages

export interface ProjectTemplate {
  id: string;
  name: string;
  projectType: ProjectType;
  description?: string;
  areas: TemplateArea[];
  createdAt: string;
  updatedAt: string;
}

// Legacy alias for backward compatibility
export type EventTemplate = ProjectTemplate;

export interface TemplateArea {
  name: string;
  description?: string;
  team?: TemplateTeamMember[]; // Team members for this area
  responsibilities: TemplateResponsibility[];
  sections?: string[]; // Optional sections (like "Secciones" in JSON)
}

export interface TemplateTeamMember {
  name: string;
  email?: string;
  handle?: string;
  wallet?: string;
}

export interface TemplateResponsibility {
  name: string;
  description?: string;
  tasks: TemplateTask[];
}

export interface TemplateTask {
  title: string;
  description?: string;
  notes?: string; // Additional notes from JSON
  estado?: TaskEstado; // Task state from template (Not Started, In Progress, Done)
  etapa?: TaskEtapa; // Task stage/timing from template
  supportResources?: string[];
}

// Helper type for raw JSON structure
export interface RawTemplateArea {
  Equipo?: Array<{
    name: string;
    email?: string;
    handle?: string;
    wallet?: string;
  }>;
  Responsabilidades?: string[];
  Secciones?: string[];
  Tareas: Array<{
    tarea: string;
    estado?: TaskEstado;
    etapa?: TaskEtapa;
    notes?: string;
  }>;
}

