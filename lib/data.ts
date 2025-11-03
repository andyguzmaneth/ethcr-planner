import "server-only";
import fs from "fs";
import path from "path";
import type {
  User,
  Event,
  Area,
  Responsibility,
  Task,
  Meeting,
  MeetingNote,
  EventTemplate,
} from "./types";
import { generateSlug } from "./utils";

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

export function getEventBySlug(slug: string): Event | undefined {
  return getEvents().find((event) => event.slug === slug);
}

export function createEvent(event: Omit<Event, "id" | "slug" | "createdAt" | "updatedAt"> & { slug?: string }): Event {
  const events = getEvents();
  const slug = event.slug || generateSlug(event.name);
  
  // Ensure slug is unique
  let uniqueSlug = slug;
  let counter = 1;
  while (events.some((e) => e.slug === uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  const newEvent: Event = {
    ...event,
    slug: uniqueSlug,
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

  // If name is being updated and no slug provided, regenerate slug
  if (updates.name && !updates.slug) {
    updates.slug = generateSlug(updates.name);
    
    // Ensure slug is unique (excluding current event)
    let uniqueSlug = updates.slug;
    let counter = 1;
    while (events.some((e) => e.id !== id && e.slug === uniqueSlug)) {
      uniqueSlug = `${updates.slug}-${counter}`;
      counter++;
    }
    updates.slug = uniqueSlug;
  }

  events[index] = {
    ...events[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile("events.json", events);
  return events[index];
}

export function joinEvent(eventId: string, userId: string): Event | null {
  const event = getEventById(eventId);
  if (!event) return null;

  const participantIds = event.participantIds || [];
  if (participantIds.includes(userId)) {
    // Already joined
    return event;
  }

  return updateEvent(eventId, {
    participantIds: [...participantIds, userId],
  });
}

export function leaveEvent(eventId: string, userId: string): Event | null {
  const event = getEventById(eventId);
  if (!event) return null;

  const participantIds = event.participantIds || [];
  if (!participantIds.includes(userId)) {
    // Not joined
    return event;
  }

  return updateEvent(eventId, {
    participantIds: participantIds.filter((id) => id !== userId),
  });
}

export function getUserJoinedEvents(userId: string): Event[] {
  return getEvents().filter(
    (event) => event.participantIds && event.participantIds.includes(userId)
  );
}

export function isUserJoinedEvent(eventId: string, userId: string): boolean {
  const event = getEventById(eventId);
  if (!event || !event.participantIds) return false;
  return event.participantIds.includes(userId);
}

// Area operations
export function getAreas(): Area[] {
  return readJsonFile<Area>("areas.json");
}

export function getAreasByEventId(eventId: string): Area[] {
  return getAreas().filter((area) => area.eventId === eventId);
}

export function getAreaById(id: string): Area | undefined {
  return getAreas().find((area) => area.id === id);
}

export function createArea(area: Omit<Area, "id" | "createdAt" | "updatedAt">): Area {
  const areas = getAreas();
  const newArea: Area = {
    ...area,
    id: `area-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  areas.push(newArea);
  writeJsonFile("areas.json", areas);
  return newArea;
}

export function updateArea(id: string, updates: Partial<Area>): Area | null {
  const areas = getAreas();
  const index = areas.findIndex((a) => a.id === id);
  if (index === -1) return null;

  areas[index] = {
    ...areas[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile("areas.json", areas);
  return areas[index];
}

// Responsibility operations
export function getResponsibilities(): Responsibility[] {
  return readJsonFile<Responsibility>("responsibilities.json");
}

export function getResponsibilitiesByAreaId(areaId: string): Responsibility[] {
  return getResponsibilities().filter((resp) => resp.areaId === areaId);
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

export function getTasksByAreaId(areaId: string): Task[] {
  return getTasks().filter((task) => task.areaId === areaId);
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


