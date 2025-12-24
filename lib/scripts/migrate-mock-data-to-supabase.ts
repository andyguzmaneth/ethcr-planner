import fs from "fs";
import path from "path";
import {
  createUser,
  createProject,
  createArea,
  createTask,
  createMeeting,
  createMeetingNote,
  getProjectBySlug,
} from "@/lib/data-supabase";
import type { User, Project, Area, Task, Meeting, MeetingNote } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");

// ID mapping: old ID -> new UUID
const idMappings = {
  users: new Map<string, string>(),
  projects: new Map<string, string>(),
  areas: new Map<string, string>(),
  tasks: new Map<string, string>(),
  meetings: new Map<string, string>(),
};

// Helper to read JSON files
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

// Helper to map old ID to new UUID
function getNewId(type: keyof typeof idMappings, oldId: string | null | undefined): string | undefined {
  if (!oldId) return undefined;
  return idMappings[type].get(oldId);
}

async function migrateUsers() {
  console.log("📦 Migrating users...");
  const users = readJsonFile<User>("users.json");

  for (const user of users) {
    try {
      const createdUser = await createUser({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        initials: user.initials,
        handle: user.handle,
        wallet: user.wallet,
      });

      idMappings.users.set(user.id, createdUser.id);
      console.log(`  ✓ Migrated user: ${user.name} (${user.id} -> ${createdUser.id})`);
    } catch (error: unknown) {
      if (error instanceof Error && (error.message.includes("duplicate") || error.message.includes("unique") || error.message.includes("already exists"))) {
        console.log(`  ⚠ User ${user.email} already exists, skipping...`);
        // Try to find existing user by email to map the ID
        // For now, we'll skip mapping - you may need to manually map these
      } else {
        console.error(`  ✗ Error migrating user ${user.name}:`, error);
        // Continue with other users even if one fails
      }
    }
  }
  console.log(`✅ Processed ${users.length} users\n`);
}

async function migrateProjects() {
  console.log("📦 Migrating projects...");
  const projects = readJsonFile<Project>("projects.json");

  for (const project of projects) {
    try {
      // Check if project already exists by slug
      const existing = await getProjectBySlug(project.slug);
      if (existing) {
        console.log(`  ⚠ Project ${project.slug} already exists, using existing ID...`);
        idMappings.projects.set(project.id, existing.id);
        continue;
      }

      // Map participant IDs
      const participantIds = (project.participantIds || [])
        .map((oldId) => getNewId("users", oldId))
        .filter((id): id is string => id !== undefined);

      const createdProject = await createProject({
        name: project.name,
        slug: project.slug,
        type: project.type,
        status: project.status,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        participantIds,
      });

      idMappings.projects.set(project.id, createdProject.id);
      console.log(`  ✓ Migrated project: ${project.name} (${project.id} -> ${createdProject.id})`);
    } catch (error) {
      console.error(`  ✗ Error migrating project ${project.name}:`, error);
      // Continue with other projects even if one fails
    }
  }
  console.log(`✅ Processed ${projects.length} projects\n`);
}

async function migrateAreas() {
  console.log("📦 Migrating areas...");
  const areas = readJsonFile<Area>("areas.json");

  for (const area of areas) {
    try {
      const projectId = getNewId("projects", area.projectId);
      if (!projectId) {
        console.log(`  ⚠ Skipping area ${area.name}: project ${area.projectId} not found`);
        continue;
      }

      const leadId = getNewId("users", area.leadId);
      const participantIds = (area.participantIds || [])
        .map((oldId) => getNewId("users", oldId))
        .filter((id): id is string => id !== undefined);

      const createdArea = await createArea({
        projectId,
        name: area.name,
        description: area.description,
        leadId: leadId || undefined,
        order: area.order,
        participantIds,
      });

      idMappings.areas.set(area.id, createdArea.id);
      console.log(`  ✓ Migrated area: ${area.name} (${area.id} -> ${createdArea.id})`);
    } catch (error) {
      console.error(`  ✗ Error migrating area ${area.name}:`, error);
      // Continue with other areas even if one fails
    }
  }
  console.log(`✅ Processed ${areas.length} areas\n`);
}

async function migrateTasks() {
  console.log("📦 Migrating tasks...");
  const tasks = readJsonFile<Task>("tasks.json");

  for (const task of tasks) {
    try {
      const projectId = getNewId("projects", task.projectId);
      if (!projectId) {
        console.log(`  ⚠ Skipping task ${task.title}: project ${task.projectId} not found`);
        continue;
      }

      const areaId = getNewId("areas", task.areaId);
      const assigneeId = getNewId("users", task.assigneeId);
      
      // Note: dependsOn will be empty on first pass, but that's okay
      // Task dependencies will be created correctly by the createTask function
      const dependsOn = (task.dependsOn || [])
        .map((oldId) => getNewId("tasks", oldId))
        .filter((id): id is string => id !== undefined);

      const createdTask = await createTask({
        projectId,
        areaId: areaId || undefined,
        title: task.title,
        description: task.description,
        assigneeId: assigneeId || undefined,
        deadline: task.deadline,
        status: task.status,
        supportResources: task.supportResources,
        templateId: task.templateId,
        isRecurring: task.isRecurring,
        recurrence: task.recurrence,
        dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
      });

      idMappings.tasks.set(task.id, createdTask.id);
      console.log(`  ✓ Migrated task: ${task.title} (${task.id} -> ${createdTask.id})`);
    } catch (error) {
      console.error(`  ✗ Error migrating task ${task.title}:`, error);
      // Continue with other tasks even if one fails
    }
  }
  console.log(`✅ Processed ${tasks.length} tasks\n`);
}

async function migrateMeetings() {
  console.log("📦 Migrating meetings...");
  const meetings = readJsonFile<Meeting>("meetings.json");

  for (const meeting of meetings) {
    try {
      const projectId = getNewId("projects", meeting.projectId);
      if (!projectId) {
        console.log(`  ⚠ Skipping meeting ${meeting.title}: project ${meeting.projectId} not found`);
        continue;
      }

      const attendeeIds = (meeting.attendeeIds || [])
        .map((oldId) => getNewId("users", oldId))
        .filter((id): id is string => id !== undefined);

      const createdMeeting = await createMeeting({
        projectId,
        title: meeting.title,
        date: meeting.date,
        time: meeting.time,
        attendeeIds,
      });

      idMappings.meetings.set(meeting.id, createdMeeting.id);
      console.log(`  ✓ Migrated meeting: ${meeting.title} (${meeting.id} -> ${createdMeeting.id})`);
    } catch (error) {
      console.error(`  ✗ Error migrating meeting ${meeting.title}:`, error);
    }
  }
  console.log(`✅ Processed ${meetings.length} meetings\n`);
}

async function migrateMeetingNotes() {
  console.log("📦 Migrating meeting notes...");
  const notes = readJsonFile<MeetingNote>("meeting-notes.json");

  for (const note of notes) {
    try {
      const meetingId = getNewId("meetings", note.meetingId);
      if (!meetingId) {
        console.log(`  ⚠ Skipping meeting note: meeting ${note.meetingId} not found`);
        continue;
      }

      const createdBy = getNewId("users", note.createdBy);
      if (!createdBy) {
        console.log(`  ⚠ Skipping meeting note: user ${note.createdBy} not found`);
        continue;
      }

      await createMeetingNote({
        meetingId,
        content: note.content,
        agenda: note.agenda,
        decisions: note.decisions,
        actionItems: note.actionItems,
        createdBy,
      });

      console.log(`  ✓ Migrated meeting note for meeting ${meetingId}`);
    } catch (error) {
      console.error(`  ✗ Error migrating meeting note:`, error);
    }
  }
  console.log(`✅ Migrated ${notes.length} meeting notes\n`);
}

async function main() {
  console.log("🚀 Starting migration from mock data to Supabase...\n");

  try {
    await migrateUsers();
    await migrateProjects();
    await migrateAreas();
    await migrateTasks();
    await migrateMeetings();
    await migrateMeetingNotes();

    console.log("✅ Migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - Users: ${idMappings.users.size}`);
    console.log(`  - Projects: ${idMappings.projects.size}`);
    console.log(`  - Areas: ${idMappings.areas.size}`);
    console.log(`  - Tasks: ${idMappings.tasks.size}`);
    console.log(`  - Meetings: ${idMappings.meetings.size}`);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

export { main as migrateMockDataToSupabase };

