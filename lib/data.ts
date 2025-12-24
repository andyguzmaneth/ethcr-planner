import "server-only";
import fs from "fs";
import path from "path";
import type {
  User,
  Event,
  Project,
  Area,
  Responsibility,
  Task,
  Meeting,
  MeetingNote,
  EventTemplate,
  ProjectTemplate,
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

// Project operations (formerly Event operations)
export function getProjects(): Project[] {
  return readJsonFile<Project>("projects.json");
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find((project) => project.id === id);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}

// Legacy aliases for backward compatibility
export const getEvents = getProjects;
export const getEventById = getProjectById;
export const getEventBySlug = getProjectBySlug;

export function createProject(project: Omit<Project, "id" | "slug" | "createdAt" | "updatedAt"> & { slug?: string }): Project {
  const projects = getProjects();
  const slug = project.slug || generateSlug(project.name);

  // Ensure slug is unique
  let uniqueSlug = slug;
  let counter = 1;
  while (projects.some((p) => p.slug === uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const newProject: Project = {
    ...project,
    slug: uniqueSlug,
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.push(newProject);
  writeJsonFile("projects.json", projects);
  return newProject;
}

// Legacy alias
export const createEvent = createProject;

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  // If name is being updated and no slug provided, regenerate slug
  if (updates.name && !updates.slug) {
    updates.slug = generateSlug(updates.name);

    // Ensure slug is unique (excluding current project)
    let uniqueSlug = updates.slug;
    let counter = 1;
    while (projects.some((p) => p.id !== id && p.slug === uniqueSlug)) {
      uniqueSlug = `${updates.slug}-${counter}`;
      counter++;
    }
    updates.slug = uniqueSlug;
  }

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile("projects.json", projects);
  return projects[index];
}

// Legacy alias
export const updateEvent = updateProject;

export function joinProject(projectId: string, userId: string): Project | null {
  const project = getProjectById(projectId);
  if (!project) return null;

  const participantIds = project.participantIds || [];
  if (participantIds.includes(userId)) {
    // Already joined
    return project;
  }

  return updateProject(projectId, {
    participantIds: [...participantIds, userId],
  });
}

export function leaveProject(projectId: string, userId: string): Project | null {
  const project = getProjectById(projectId);
  if (!project) return null;

  const participantIds = project.participantIds || [];
  if (!participantIds.includes(userId)) {
    // Not joined
    return project;
  }

  return updateProject(projectId, {
    participantIds: participantIds.filter((id) => id !== userId),
  });
}

export function getUserJoinedProjects(userId: string): Project[] {
  return getProjects().filter(
    (project) => project.participantIds && project.participantIds.includes(userId)
  );
}

export function isUserJoinedProject(projectId: string, userId: string): boolean {
  const project = getProjectById(projectId);
  if (!project || !project.participantIds) return false;
  return project.participantIds.includes(userId);
}

// Legacy aliases
export const joinEvent = joinProject;
export const leaveEvent = leaveProject;
export const getUserJoinedEvents = getUserJoinedProjects;
export const isUserJoinedEvent = isUserJoinedProject;

// Area operations
export function getAreas(): Area[] {
  return readJsonFile<Area>("areas.json");
}

export function getAreasByProjectId(projectId: string): Area[] {
  const allAreas = getAreas();
  let areas = allAreas.filter((area) => area.projectId === projectId || area.eventId === projectId); // Support both for migration
  
  // Migrate areas without order values
  let needsUpdate = false;
  const areasWithoutOrder = areas.filter((area) => area.order === undefined);
  if (areasWithoutOrder.length > 0) {
    const areasWithOrder = areas.filter((area) => area.order !== undefined);
    const maxOrder = areasWithOrder.reduce((max, a) => Math.max(max, a.order ?? 0), 0);
    
    // Sort areas without order by createdAt
    const sortedWithoutOrder = [...areasWithoutOrder].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Assign order values - update both in filtered array and allAreas array
    sortedWithoutOrder.forEach((area, index) => {
      const newOrder = maxOrder + index + 1;
      area.order = newOrder;
      area.updatedAt = new Date().toISOString();
      
      // Update in allAreas array as well
      const areaInAll = allAreas.find((a) => a.id === area.id);
      if (areaInAll) {
        areaInAll.order = newOrder;
        areaInAll.updatedAt = area.updatedAt;
      }
    });
    
    needsUpdate = true;
  }
  
  // Save if we made changes
  if (needsUpdate) {
    writeJsonFile("areas.json", allAreas);
    // Reload to get updated data
    const updatedAreas = getAreas();
    areas = updatedAreas.filter((area) => area.projectId === projectId || area.eventId === projectId);
  }
  
  // Sort by order, then by createdAt for areas without order (shouldn't happen after migration)
  return areas.sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // If orders are equal (or both undefined), sort by createdAt
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

// Legacy alias
export const getAreasByEventId = getAreasByProjectId;

export function getAreaById(id: string): Area | undefined {
  return getAreas().find((area) => area.id === id);
}

export function createArea(area: Omit<Area, "id" | "createdAt" | "updatedAt">): Area {
  const areas = getAreas();
  const projectId = area.projectId || (area as any).eventId; // Support both during migration
  const projectAreas = areas.filter((a) => a.projectId === projectId || a.eventId === projectId);
  const maxOrder = projectAreas.reduce((max, a) => Math.max(max, a.order ?? 0), 0);
  
  const newArea: Area = {
    ...area,
    order: area.order ?? maxOrder + 1,
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

export function deleteArea(id: string): boolean {
  const areas = getAreas();
  const index = areas.findIndex((a) => a.id === id);
  if (index === -1) return false;

  // Delete all tasks associated with this area
  const tasks = getTasks();
  
  // Remove tasks that belong to this area
  const remainingTasks = tasks.filter((task) => task.areaId !== id);
  if (remainingTasks.length !== tasks.length) {
    writeJsonFile("tasks.json", remainingTasks);
  }

  // Delete the area
  areas.splice(index, 1);
  writeJsonFile("areas.json", areas);
  
  return true;
}

export function reorderAreas(projectId: string, areaOrders: { id: string; order: number }[]): boolean {
  const areas = getAreas();
  const projectAreas = areas.filter((a) => a.projectId === projectId || a.eventId === projectId);
  
  // Create a map of new orders
  const orderMap = new Map(areaOrders.map((ao) => [ao.id, ao.order]));
  
  // Update all project areas
  let updated = false;
  for (const area of projectAreas) {
    const newOrder = orderMap.get(area.id);
    if (newOrder !== undefined && area.order !== newOrder) {
      area.order = newOrder;
      area.updatedAt = new Date().toISOString();
      updated = true;
    }
  }
  
  if (updated) {
    writeJsonFile("areas.json", areas);
  }
  
  return updated;
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

export function getTasksByProjectId(projectId: string): Task[] {
  return getTasks().filter((task) => task.projectId === projectId || task.eventId === projectId);
}

// Legacy alias
export const getTasksByEventId = getTasksByProjectId;

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

export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;

  tasks.splice(index, 1);
  writeJsonFile("tasks.json", tasks);
  return true;
}

// Meeting operations
export function getMeetings(): Meeting[] {
  return readJsonFile<Meeting>("meetings.json");
}

export function getMeetingsByProjectId(projectId: string): Meeting[] {
  return getMeetings().filter((meeting) => meeting.projectId === projectId || meeting.eventId === projectId);
}

// Legacy alias
export const getMeetingsByEventId = getMeetingsByProjectId;

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
export function getTemplates(): ProjectTemplate[] {
  return readJsonFile<ProjectTemplate>("templates.json");
}

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return getTemplates().find((template) => template.id === id);
}

export function getTemplateByName(name: string): ProjectTemplate | undefined {
  return getTemplates().find((template) => template.name === name);
}

export function createTemplate(
  template: Omit<ProjectTemplate, "id" | "createdAt" | "updatedAt">
): ProjectTemplate {
  const templates = getTemplates();
  const newTemplate: ProjectTemplate = {
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
  updates: Partial<ProjectTemplate>
): ProjectTemplate | null {
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


