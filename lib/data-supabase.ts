import "server-only";
import { supabaseAdmin } from "./supabase/server";
import type {
  User,
  Project,
  Area,
  Responsibility,
  Task,
  Meeting,
  MeetingNote,
  ProjectTemplate,
} from "./types";
import { generateSlug } from "./utils";

// Transform functions
function transformUser(db: any): User {
  return {
    id: db.id,
    name: db.name,
    email: db.email,
    avatar: db.avatar,
    initials: db.initials,
    handle: db.handle,
    wallet: db.wallet,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function transformProject(db: any, participants: User[] = []): Project {
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    type: db.type,
    status: db.status,
    description: db.description,
    startDate: db.start_date,
    endDate: db.end_date,
    participantIds: participants.map((p) => p.id),
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function transformArea(db: any, participants: User[] = []): Area {
  return {
    id: db.id,
    projectId: db.project_id,
    name: db.name,
    description: db.description,
    leadId: db.lead_id,
    participantIds: participants.map((p) => p.id),
    order: db.display_order,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function transformTask(db: any): Task {
  return {
    id: db.id,
    projectId: db.project_id,
    areaId: db.area_id,
    title: db.title,
    description: db.description,
    assigneeId: db.assignee_id,
    deadline: db.deadline,
    status: db.status,
    supportResources: db.support_resources,
    templateId: db.template_id,
    isRecurring: db.is_recurring,
    recurrence: db.recurrence,
    dependsOn: undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    completedAt: db.completed_at,
  };
}

function transformMeeting(db: any, attendees: User[] = []): Meeting {
  return {
    id: db.id,
    projectId: db.project_id,
    title: db.title,
    date: db.date,
    time: db.time,
    attendeeIds: attendees.map((a) => a.id),
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function transformMeetingNote(db: any): MeetingNote {
  return {
    id: db.id,
    meetingId: db.meeting_id,
    content: db.content,
    agenda: db.agenda,
    decisions: db.decisions,
    actionItems: db.action_items,
    createdBy: db.created_by,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// Helper: Fetch users by IDs and group by relation
async function fetchUsersByRelation(
  junctionTable: string,
  relationIdField: string,
  relationIds: string[],
  userIdField = "user_id"
): Promise<Map<string, User[]>> {
  if (relationIds.length === 0) return new Map();

  const { data: rows } = await supabaseAdmin
    .from(junctionTable)
    .select(`${relationIdField}, ${userIdField}`)
    .in(relationIdField, relationIds);

  const userIds = [...new Set((rows || []).map((r: any) => r[userIdField]))];
  if (userIds.length === 0) return new Map();

  const { data: usersData } = await supabaseAdmin
    .from("users")
    .select("*")
    .in("id", userIds);

  const usersMap = new Map((usersData || []).map((u: any) => [u.id, transformUser(u)]));
  const grouped = new Map<string, User[]>();

  (rows || []).forEach((row: any) => {
    const user = usersMap.get(row[userIdField]);
    if (!user) return;
    const relationId = row[relationIdField];
    if (!grouped.has(relationId)) {
      grouped.set(relationId, []);
    }
    grouped.get(relationId)!.push(user);
  });

  return grouped;
}

// Helper: Fetch users for a single relation
async function fetchUsersForRelation(
  junctionTable: string,
  relationIdField: string,
  relationId: string,
  userIdField = "user_id"
): Promise<User[]> {
  const { data: rows } = await supabaseAdmin
    .from(junctionTable)
    .select(userIdField)
    .eq(relationIdField, relationId);

  const userIds = (rows || []).map((r: any) => r[userIdField]);
  if (userIds.length === 0) return [];

  const { data: usersData } = await supabaseAdmin.from("users").select("*").in("id", userIds);
  return (usersData || []).map(transformUser);
}

// Helper: Fetch task dependencies
async function fetchTaskDependencies(taskIds: string[]): Promise<Map<string, string[]>> {
  if (taskIds.length === 0) return new Map();

  const { data: dependencies } = await supabaseAdmin
    .from("task_dependencies")
    .select("task_id, depends_on_task_id")
    .in("task_id", taskIds);

  const grouped = new Map<string, string[]>();
  (dependencies || []).forEach((td: any) => {
    const taskId = td.task_id;
    if (!grouped.has(taskId)) {
      grouped.set(taskId, []);
    }
    grouped.get(taskId)!.push(td.depends_on_task_id);
  });

  return grouped;
}

// User operations
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabaseAdmin.from("users").select("*").order("created_at");
  if (error) throw error;
  return (data || []).map(transformUser);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", id).single();
  if (error || !data) return undefined;
  return transformUser(data);
}

export async function createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      initials: user.initials,
      handle: user.handle,
      wallet: user.wallet,
    })
    .select()
    .single();
  if (error) throw error;
  return transformUser(data);
}

// Project operations
export async function getProjects(): Promise<Project[]> {
  const { data: projects, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!projects || projects.length === 0) return [];

  const participantsByProject = await fetchUsersByRelation(
    "project_participants",
    "project_id",
    projects.map((p) => p.id)
  );

  return projects.map((p) => transformProject(p, participantsByProject.get(p.id) || []));
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const { data: project, error } = await supabaseAdmin.from("projects").select("*").eq("id", id).single();
  if (error || !project) return undefined;

  const participants = await fetchUsersForRelation("project_participants", "project_id", id);
  return transformProject(project, participants);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const { data: project, error } = await supabaseAdmin.from("projects").select("*").eq("slug", slug).single();
  if (error || !project) return undefined;

  const participants = await fetchUsersForRelation("project_participants", "project_id", project.id);
  return transformProject(project, participants);
}

export async function createProject(
  project: Omit<Project, "id" | "slug" | "createdAt" | "updatedAt" | "participantIds"> & {
    slug?: string;
    participantIds?: string[];
  }
): Promise<Project> {
  const slug = project.slug || generateSlug(project.name);

  let uniqueSlug = slug;
  let counter = 1;
  while (true) {
    const { data: existing } = await supabaseAdmin.from("projects").select("id").eq("slug", uniqueSlug).single();
    if (!existing) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const { data: newProject, error } = await supabaseAdmin
    .from("projects")
    .insert({
      name: project.name,
      slug: uniqueSlug,
      type: project.type,
      status: project.status,
      description: project.description,
      start_date: project.startDate,
      end_date: project.endDate,
    })
    .select()
    .single();

  if (error) throw error;

  if (project.participantIds && project.participantIds.length > 0) {
    await supabaseAdmin.from("project_participants").insert(
      project.participantIds.map((userId) => ({
        project_id: newProject.id,
        user_id: userId,
      }))
    );
  }

  return getProjectById(newProject.id) as Promise<Project>;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.slug) updateData.slug = updates.slug;
  if (updates.type) updateData.type = updates.type;
  if (updates.status) updateData.status = updates.status;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;

  const { error } = await supabaseAdmin.from("projects").update(updateData).eq("id", id);
  if (error) throw error;

  if (updates.participantIds) {
    await supabaseAdmin.from("project_participants").delete().eq("project_id", id);
    if (updates.participantIds.length > 0) {
      await supabaseAdmin.from("project_participants").insert(
        updates.participantIds.map((userId) => ({
          project_id: id,
          user_id: userId,
        }))
      );
    }
  }

  return getProjectById(id);
}

export async function joinProject(projectId: string, userId: string): Promise<Project | null> {
  const { error } = await supabaseAdmin
    .from("project_participants")
    .insert({ project_id: projectId, user_id: userId });

  if (error && error.code !== "23505") throw error;
  return getProjectById(projectId);
}

export async function leaveProject(projectId: string, userId: string): Promise<Project | null> {
  await supabaseAdmin.from("project_participants").delete().eq("project_id", projectId).eq("user_id", userId);
  return getProjectById(projectId);
}

export async function getUserJoinedProjects(userId: string): Promise<Project[]> {
  const { data } = await supabaseAdmin
    .from("project_participants")
    .select("project_id")
    .eq("user_id", userId);

  if (!data || data.length === 0) return [];

  const projectIds = data.map((p) => p.project_id);
  const projects = await Promise.all(projectIds.map((id) => getProjectById(id)));
  return projects.filter((p): p is Project => p !== undefined);
}

export async function isUserJoinedProject(projectId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("project_participants")
    .select("user_id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .single();

  return !!data;
}

// Area operations
export async function getAreas(): Promise<Area[]> {
  const { data, error } = await supabaseAdmin.from("areas").select("*").order("display_order");
  if (error) throw error;
  if (!data || data.length === 0) return [];

  const participantsByArea = await fetchUsersByRelation(
    "area_participants",
    "area_id",
    data.map((a) => a.id)
  );

  return data.map((a) => transformArea(a, participantsByArea.get(a.id) || []));
}

export async function getAreasByProjectId(projectId: string): Promise<Area[]> {
  const { data, error } = await supabaseAdmin
    .from("areas")
    .select("*")
    .eq("project_id", projectId)
    .order("display_order");

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const participantsByArea = await fetchUsersByRelation(
    "area_participants",
    "area_id",
    data.map((a) => a.id)
  );

  return data.map((a) => transformArea(a, participantsByArea.get(a.id) || []));
}

export async function getAreaById(id: string): Promise<Area | undefined> {
  const { data, error } = await supabaseAdmin.from("areas").select("*").eq("id", id).single();
  if (error || !data) return undefined;

  const participants = await fetchUsersForRelation("area_participants", "area_id", id);
  return transformArea(data, participants);
}

export async function createArea(area: Omit<Area, "id" | "createdAt" | "updatedAt">): Promise<Area> {
  const { data: existingAreas } = await supabaseAdmin
    .from("areas")
    .select("display_order")
    .eq("project_id", area.projectId)
    .order("display_order", { ascending: false })
    .limit(1);

  const maxOrder = existingAreas && existingAreas.length > 0 ? existingAreas[0].display_order : 0;

  const { data, error } = await supabaseAdmin
    .from("areas")
    .insert({
      project_id: area.projectId,
      name: area.name,
      description: area.description,
      lead_id: area.leadId,
      display_order: area.order ?? maxOrder + 1,
    })
    .select()
    .single();

  if (error) throw error;

  if (area.participantIds && area.participantIds.length > 0) {
    await supabaseAdmin.from("area_participants").insert(
      area.participantIds.map((userId) => ({
        area_id: data.id,
        user_id: userId,
      }))
    );
  }

  return getAreaById(data.id) as Promise<Area>;
}

export async function updateArea(id: string, updates: Partial<Area>): Promise<Area | null> {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.leadId !== undefined) updateData.lead_id = updates.leadId;
  if (updates.order !== undefined) updateData.display_order = updates.order;

  const { error } = await supabaseAdmin.from("areas").update(updateData).eq("id", id);
  if (error) throw error;

  if (updates.participantIds) {
    await supabaseAdmin.from("area_participants").delete().eq("area_id", id);
    if (updates.participantIds.length > 0) {
      await supabaseAdmin.from("area_participants").insert(
        updates.participantIds.map((userId) => ({
          area_id: id,
          user_id: userId,
        }))
      );
    }
  }

  return getAreaById(id);
}

export async function deleteArea(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("areas").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function reorderAreas(
  projectId: string,
  areaOrders: { id: string; order: number }[]
): Promise<boolean> {
  await Promise.all(
    areaOrders.map((ao) =>
      supabaseAdmin.from("areas").update({ display_order: ao.order }).eq("id", ao.id).eq("project_id", projectId)
    )
  );
  return true;
}

// Responsibility operations
export async function getResponsibilities(): Promise<Responsibility[]> {
  const { data, error } = await supabaseAdmin.from("responsibilities").select("*").order("created_at");
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    areaId: r.area_id,
    name: r.name,
    description: r.description,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function getResponsibilitiesByAreaId(areaId: string): Promise<Responsibility[]> {
  const { data, error } = await supabaseAdmin
    .from("responsibilities")
    .select("*")
    .eq("area_id", areaId)
    .order("created_at");

  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    areaId: r.area_id,
    name: r.name,
    description: r.description,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function createResponsibility(
  responsibility: Omit<Responsibility, "id" | "createdAt" | "updatedAt">
): Promise<Responsibility> {
  const { data, error } = await supabaseAdmin
    .from("responsibilities")
    .insert({
      area_id: responsibility.areaId,
      name: responsibility.name,
      description: responsibility.description,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    areaId: data.area_id,
    name: data.name,
    description: data.description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Task operations
async function getTasksWithDependencies(taskData: any[]): Promise<Task[]> {
  if (taskData.length === 0) return [];

  const dependenciesByTask = await fetchTaskDependencies(taskData.map((t) => t.id));

  return taskData.map((t) => {
    const task = transformTask(t);
    task.dependsOn = dependenciesByTask.get(t.id) || undefined;
    return task;
  });
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabaseAdmin.from("tasks").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return getTasksWithDependencies(data || []);
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return getTasksWithDependencies(data || []);
}

export async function getTasksByAreaId(areaId: string): Promise<Task[]> {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("area_id", areaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return getTasksWithDependencies(data || []);
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const { data, error } = await supabaseAdmin.from("tasks").select("*").eq("id", id).single();
  if (error || !data) return undefined;

  const { data: dependencies } = await supabaseAdmin
    .from("task_dependencies")
    .select("depends_on_task_id")
    .eq("task_id", id);

  const task = transformTask(data);
  task.dependsOn = dependencies?.map((d) => d.depends_on_task_id) || undefined;
  return task;
}

export async function createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .insert({
      project_id: task.projectId,
      area_id: task.areaId,
      title: task.title,
      description: task.description,
      assignee_id: task.assigneeId,
      deadline: task.deadline,
      status: task.status || "pending",
      support_resources: task.supportResources,
      template_id: task.templateId,
      is_recurring: task.isRecurring,
      recurrence: task.recurrence,
    })
    .select()
    .single();

  if (error) throw error;

  if (task.dependsOn && task.dependsOn.length > 0) {
    await supabaseAdmin.from("task_dependencies").insert(
      task.dependsOn.map((depId) => ({
        task_id: data.id,
        depends_on_task_id: depId,
      }))
    );
  }

  return getTaskById(data.id) as Promise<Task>;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const updateData: any = {};
  if (updates.title) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.assigneeId !== undefined) updateData.assignee_id = updates.assigneeId;
  if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
  if (updates.status) {
    updateData.status = updates.status;
    updateData.completed_at = updates.status === "completed" ? new Date().toISOString() : null;
  }
  if (updates.supportResources !== undefined) updateData.support_resources = updates.supportResources;
  if (updates.templateId !== undefined) updateData.template_id = updates.templateId;
  if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
  if (updates.recurrence !== undefined) updateData.recurrence = updates.recurrence;

  const { error } = await supabaseAdmin.from("tasks").update(updateData).eq("id", id);
  if (error) throw error;

  if (updates.dependsOn !== undefined) {
    await supabaseAdmin.from("task_dependencies").delete().eq("task_id", id);
    if (updates.dependsOn.length > 0) {
      await supabaseAdmin.from("task_dependencies").insert(
        updates.dependsOn.map((depId) => ({
          task_id: id,
          depends_on_task_id: depId,
        }))
      );
    }
  }

  return getTaskById(id);
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// Meeting operations
export async function getMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabaseAdmin.from("meetings").select("*").order("date", { ascending: false });
  if (error) throw error;
  if (!data || data.length === 0) return [];

  const attendeesByMeeting = await fetchUsersByRelation(
    "meeting_attendees",
    "meeting_id",
    data.map((m) => m.id)
  );

  return data.map((m) => transformMeeting(m, attendeesByMeeting.get(m.id) || []));
}

export async function getMeetingsByProjectId(projectId: string): Promise<Meeting[]> {
  const { data, error } = await supabaseAdmin
    .from("meetings")
    .select("*")
    .eq("project_id", projectId)
    .order("date", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const attendeesByMeeting = await fetchUsersByRelation(
    "meeting_attendees",
    "meeting_id",
    data.map((m) => m.id)
  );

  return data.map((m) => transformMeeting(m, attendeesByMeeting.get(m.id) || []));
}

export async function getMeetingById(id: string): Promise<Meeting | undefined> {
  const { data, error } = await supabaseAdmin.from("meetings").select("*").eq("id", id).single();
  if (error || !data) return undefined;

  const attendees = await fetchUsersForRelation("meeting_attendees", "meeting_id", id);
  return transformMeeting(data, attendees);
}

export async function createMeeting(meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">): Promise<Meeting> {
  const { data, error } = await supabaseAdmin
    .from("meetings")
    .insert({
      project_id: meeting.projectId,
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
    })
    .select()
    .single();

  if (error) throw error;

  if (meeting.attendeeIds && meeting.attendeeIds.length > 0) {
    await supabaseAdmin.from("meeting_attendees").insert(
      meeting.attendeeIds.map((userId) => ({
        meeting_id: data.id,
        user_id: userId,
      }))
    );
  }

  return getMeetingById(data.id) as Promise<Meeting>;
}

// Meeting Notes operations
export async function getMeetingNotes(): Promise<MeetingNote[]> {
  const { data, error } = await supabaseAdmin.from("meeting_notes").select("*").order("created_at");
  if (error) throw error;
  return (data || []).map(transformMeetingNote);
}

export async function getMeetingNoteByMeetingId(meetingId: string): Promise<MeetingNote | undefined> {
  const { data, error } = await supabaseAdmin
    .from("meeting_notes")
    .select("*")
    .eq("meeting_id", meetingId)
    .single();

  if (error || !data) return undefined;
  return transformMeetingNote(data);
}

export async function createMeetingNote(
  note: Omit<MeetingNote, "id" | "createdAt" | "updatedAt">
): Promise<MeetingNote> {
  const { data, error } = await supabaseAdmin
    .from("meeting_notes")
    .insert({
      meeting_id: note.meetingId,
      content: note.content,
      agenda: note.agenda,
      decisions: note.decisions,
      action_items: note.actionItems,
      created_by: note.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return transformMeetingNote(data);
}

export async function updateMeetingNote(
  id: string,
  updates: Partial<MeetingNote>
): Promise<MeetingNote | null> {
  const updateData: any = {};
  if (updates.content) updateData.content = updates.content;
  if (updates.agenda !== undefined) updateData.agenda = updates.agenda;
  if (updates.decisions !== undefined) updateData.decisions = updates.decisions;
  if (updates.actionItems !== undefined) updateData.action_items = updates.actionItems;

  const { error } = await supabaseAdmin.from("meeting_notes").update(updateData).eq("id", id);
  if (error) throw error;

  const { data } = await supabaseAdmin.from("meeting_notes").select("*").eq("id", id).single();
  if (!data) return null;
  return transformMeetingNote(data);
}

// Template operations
export async function getTemplates(): Promise<ProjectTemplate[]> {
  const { data, error } = await supabaseAdmin.from("project_templates").select("*").order("created_at");
  if (error) throw error;
  return (data || []).map((t) => ({
    id: t.id,
    name: t.name,
    projectType: t.project_type,
    description: t.description,
    areas: t.template_data.areas,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));
}

export async function getTemplateById(id: string): Promise<ProjectTemplate | undefined> {
  const { data, error } = await supabaseAdmin.from("project_templates").select("*").eq("id", id).single();
  if (error || !data) return undefined;
  return {
    id: data.id,
    name: data.name,
    projectType: data.project_type,
    description: data.description,
    areas: data.template_data.areas,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createTemplate(
  template: Omit<ProjectTemplate, "id" | "createdAt" | "updatedAt">
): Promise<ProjectTemplate> {
  const { data, error } = await supabaseAdmin
    .from("project_templates")
    .insert({
      name: template.name,
      project_type: template.projectType,
      description: template.description,
      template_data: { areas: template.areas },
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    projectType: data.project_type,
    description: data.description,
    areas: data.template_data.areas,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
