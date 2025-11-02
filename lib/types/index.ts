// Type definitions for all entities

export type TaskStatus = "pending" | "in_progress" | "blocked" | "completed";
export type EventType = "Meetup" | "Conference" | "Custom";
export type EventStatus = "In Planning" | "Active" | "Completed" | "Cancelled";

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

export interface Event {
  id: string;
  name: string;
  type: EventType;
  status: EventStatus;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  leadId: string; // User ID
  participantIds: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
}

export interface Responsibility {
  id: string;
  trackId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  responsibilityId: string;
  trackId: string;
  eventId: string;
  title: string;
  description?: string;
  assigneeId?: string; // User ID
  deadline?: string; // ISO date string
  status: TaskStatus;
  supportResources?: string[]; // URLs or text notes
  templateId?: string; // If created from a template
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Meeting {
  id: string;
  eventId: string;
  title: string;
  date: string; // ISO date string
  time: string; // Time string (e.g., "14:00")
  attendeeIds: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
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

export interface EventTemplate {
  id: string;
  name: string;
  eventType: EventType;
  description?: string;
  tracks: TemplateTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateTrack {
  name: string;
  description?: string;
  team?: TemplateTeamMember[]; // Team members for this track
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

