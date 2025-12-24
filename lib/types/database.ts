// Database types matching the Supabase schema
// These types correspond to the database tables and can be used with Supabase client

export type ProjectType = 'Meetup' | 'Conference' | 'Property' | 'Custom';
export type ProjectStatus = 'In Planning' | 'Active' | 'Completed' | 'Cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Database table types
export interface DatabaseUser {
  id: string; // UUID
  name: string;
  email: string;
  avatar: string | null;
  initials: string;
  handle: string | null;
  wallet: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DatabaseProject {
  id: string; // UUID
  name: string;
  slug: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string | null;
  start_date: string | null; // ISO date
  end_date: string | null; // ISO date
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DatabaseProjectParticipant {
  project_id: string; // UUID
  user_id: string; // UUID
}

export interface DatabaseArea {
  id: string; // UUID
  project_id: string; // UUID
  name: string;
  description: string | null;
  lead_id: string | null; // UUID
  display_order: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DatabaseAreaParticipant {
  area_id: string; // UUID
  user_id: string; // UUID
}

export interface DatabaseResponsibility {
  id: string; // UUID
  area_id: string; // UUID
  name: string;
  description: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DatabaseTask {
  id: string; // UUID
  project_id: string; // UUID
  area_id: string | null; // UUID
  title: string;
  description: string | null;
  assignee_id: string | null; // UUID
  deadline: string | null; // ISO date
  status: TaskStatus;
  support_resources: string[] | null; // JSONB array
  template_id: string | null;
  is_recurring: boolean;
  recurrence: {
    frequency: RecurrenceFrequency;
    interval: number;
    end_date?: string; // ISO date
  } | null; // JSONB object
  completed_at: string | null; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DatabaseTaskDependency {
  task_id: string; // UUID
  depends_on_task_id: string; // UUID
}

export interface DatabaseMeeting {
  id: string; // UUID
  project_id: string; // UUID
  title: string;
  date: string; // ISO date
  time: string; // Time string (HH:MM:SS)
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DatabaseMeetingAttendee {
  meeting_id: string; // UUID
  user_id: string; // UUID
}

export interface DatabaseMeetingNote {
  id: string; // UUID
  meeting_id: string; // UUID
  content: string;
  agenda: string | null;
  decisions: string | null;
  action_items: string[] | null; // JSONB array
  created_by: string; // UUID
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DatabaseProjectTemplate {
  id: string; // UUID
  name: string;
  project_type: ProjectType;
  description: string | null;
  template_data: {
    // This matches the ProjectTemplate structure from types/index.ts
    areas: Array<{
      name: string;
      description?: string;
      team?: Array<{
        name: string;
        email?: string;
        handle?: string;
        wallet?: string;
      }>;
      responsibilities: Array<{
        name: string;
        description?: string;
        tasks: Array<{
          title: string;
          description?: string;
          notes?: string;
          estado?: string;
          etapa?: string;
          supportResources?: string[];
        }>;
      }>;
      sections?: string[];
    }>;
  }; // JSONB
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Helper type for Supabase database schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: DatabaseUser;
        Insert: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseUser, 'id' | 'created_at'>>;
      };
      projects: {
        Row: DatabaseProject;
        Insert: Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseProject, 'id' | 'created_at'>>;
      };
      project_participants: {
        Row: DatabaseProjectParticipant;
        Insert: DatabaseProjectParticipant;
        Update: never; // Junction table, typically not updated
      };
      areas: {
        Row: DatabaseArea;
        Insert: Omit<DatabaseArea, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseArea, 'id' | 'created_at'>>;
      };
      area_participants: {
        Row: DatabaseAreaParticipant;
        Insert: DatabaseAreaParticipant;
        Update: never;
      };
      responsibilities: {
        Row: DatabaseResponsibility;
        Insert: Omit<DatabaseResponsibility, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseResponsibility, 'id' | 'created_at'>>;
      };
      tasks: {
        Row: DatabaseTask;
        Insert: Omit<DatabaseTask, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseTask, 'id' | 'created_at'>>;
      };
      task_dependencies: {
        Row: DatabaseTaskDependency;
        Insert: DatabaseTaskDependency;
        Update: never;
      };
      meetings: {
        Row: DatabaseMeeting;
        Insert: Omit<DatabaseMeeting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseMeeting, 'id' | 'created_at'>>;
      };
      meeting_attendees: {
        Row: DatabaseMeetingAttendee;
        Insert: DatabaseMeetingAttendee;
        Update: never;
      };
      meeting_notes: {
        Row: DatabaseMeetingNote;
        Insert: Omit<DatabaseMeetingNote, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseMeetingNote, 'id' | 'created_at'>>;
      };
      project_templates: {
        Row: DatabaseProjectTemplate;
        Insert: Omit<DatabaseProjectTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseProjectTemplate, 'id' | 'created_at'>>;
      };
    };
  };
}

