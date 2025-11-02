import "server-only";
import fs from "fs";
import path from "path";
import type {
  User,
  Event,
  Track,
  Responsibility,
  Task,
  Meeting,
  MeetingNote,
  EventTemplate,
} from "./types";

const dataDir = path.join(process.cwd(), "data");

// Helper function to read JSON files
function readJsonFile<T>(filename: string): T[] {
  try {
    const filePath = path.join(dataDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Helper function to write JSON files
function writeJsonFile<T>(filename: string, data: T[]): void {
  try {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

// User operations
export function getUsers(): User[] {
  return readJsonFile<User>("users.json");
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((user) => user.id === id);
}

export function createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeJsonFile("users.json", users);
  return newUser;
}

// Event operations
export function getEvents(): Event[] {
  return readJsonFile<Event>("events.json");
}

export function getEventById(id: string): Event | undefined {
  return getEvents().find((event) => event.id === id);
}

export function createEvent(event: Omit<Event, "id" | "createdAt" | "updatedAt">): Event {
  const events = getEvents();
  const newEvent: Event = {
    ...event,
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  events.push(newEvent);
  writeJsonFile("events.json", events);
  return newEvent;
}

export function updateEvent(id: string, updates: Partial<Event>): Event | null {
  const events = getEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  events[index] = {
    ...events[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile("events.json", events);
  return events[index];
}

// Track operations
export function getTracks(): Track[] {
  return readJsonFile<Track>("tracks.json");
}

export function getTracksByEventId(eventId: string): Track[] {
  return getTracks().filter((track) => track.eventId === eventId);
}

export function getTrackById(id: string): Track | undefined {
  return getTracks().find((track) => track.id === id);
}

export function createTrack(track: Omit<Track, "id" | "createdAt" | "updatedAt">): Track {
  const tracks = getTracks();
  const newTrack: Track = {
    ...track,
    id: `track-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tracks.push(newTrack);
  writeJsonFile("tracks.json", tracks);
  return newTrack;
}

export function updateTrack(id: string, updates: Partial<Track>): Track | null {
  const tracks = getTracks();
  const index = tracks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  tracks[index] = {
    ...tracks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile("tracks.json", tracks);
  return tracks[index];
}

// Responsibility operations
export function getResponsibilities(): Responsibility[] {
  return readJsonFile<Responsibility>("responsibilities.json");
}

export function getResponsibilitiesByTrackId(trackId: string): Responsibility[] {
  return getResponsibilities().filter((resp) => resp.trackId === trackId);
}

export function getResponsibilityById(id: string): Responsibility | undefined {
  return getResponsibilities().find((resp) => resp.id === id);
}

export function createResponsibility(
  responsibility: Omit<Responsibility, "id" | "createdAt" | "updatedAt">
): Responsibility {
  const responsibilities = getResponsibilities();
  const newResponsibility: Responsibility = {
    ...responsibility,
    id: `resp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  responsibilities.push(newResponsibility);
  writeJsonFile("responsibilities.json", responsibilities);
  return newResponsibility;
}

// Task operations
export function getTasks(): Task[] {
  return readJsonFile<Task>("tasks.json");
}

export function getTasksByEventId(eventId: string): Task[] {
  return getTasks().filter((task) => task.eventId === eventId);
}

export function getTasksByTrackId(trackId: string): Task[] {
  return getTasks().filter((task) => task.trackId === trackId);
}

export function getTaskById(id: string): Task | undefined {
  return getTasks().find((task) => task.id === id);
}

export function createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeJsonFile("tasks.json", tasks);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updatedTask = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // If status is being changed to completed, set completedAt
  if (updates.status === "completed" && !updatedTask.completedAt) {
    updatedTask.completedAt = new Date().toISOString();
  }

  tasks[index] = updatedTask;
  writeJsonFile("tasks.json", tasks);
  return tasks[index];
}

// Meeting operations
export function getMeetings(): Meeting[] {
  return readJsonFile<Meeting>("meetings.json");
}

export function getMeetingsByEventId(eventId: string): Meeting[] {
  return getMeetings().filter((meeting) => meeting.eventId === eventId);
}

export function getMeetingById(id: string): Meeting | undefined {
  return getMeetings().find((meeting) => meeting.id === id);
}

export function createMeeting(meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">): Meeting {
  const meetings = getMeetings();
  const newMeeting: Meeting = {
    ...meeting,
    id: `meeting-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  meetings.push(newMeeting);
  writeJsonFile("meetings.json", meetings);
  return newMeeting;
}

// Meeting Notes operations
export function getMeetingNotes(): MeetingNote[] {
  return readJsonFile<MeetingNote>("meeting-notes.json");
}

export function getMeetingNoteByMeetingId(meetingId: string): MeetingNote | undefined {
  return getMeetingNotes().find((note) => note.meetingId === meetingId);
}

export function createMeetingNote(
  note: Omit<MeetingNote, "id" | "createdAt" | "updatedAt">
): MeetingNote {
  const notes = getMeetingNotes();
  const newNote: MeetingNote = {
    ...note,
    id: `note-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.push(newNote);
  writeJsonFile("meeting-notes.json", notes);
  return newNote;
}

export function updateMeetingNote(
  id: string,
  updates: Partial<MeetingNote>
): MeetingNote | null {
  const notes = getMeetingNotes();
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return null;

  notes[index] = {
    ...notes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile("meeting-notes.json", notes);
  return notes[index];
}

// Template operations
export function getTemplates(): EventTemplate[] {
  return readJsonFile<EventTemplate>("templates.json");
}

export function getTemplateById(id: string): EventTemplate | undefined {
  return getTemplates().find((template) => template.id === id);
}

export function getTemplateByName(name: string): EventTemplate | undefined {
  return getTemplates().find((template) => template.name === name);
}

export function createTemplate(
  template: Omit<EventTemplate, "id" | "createdAt" | "updatedAt">
): EventTemplate {
  const templates = getTemplates();
  const newTemplate: EventTemplate = {
    ...template,
    id: `template-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  writeJsonFile("templates.json", templates);
  return newTemplate;
}

export function updateTemplate(
  id: string,
  updates: Partial<EventTemplate>
): EventTemplate | null {
  const templates = getTemplates();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return null;

  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile("templates.json", templates);
  return templates[index];
}

export function deleteTemplate(id: string): boolean {
  const templates = getTemplates();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return false;

  templates.splice(index, 1);
  writeJsonFile("templates.json", templates);
  return true;
}


