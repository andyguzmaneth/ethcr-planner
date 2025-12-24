/**
 * Standalone script to create the "La Itaba" Property Management project
 * Run with: node lib/scripts/create-la-itaba-project.js
 */

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../../data");
const templatePath = path.join(dataDir, "residential-property-template.json");
const projectsPath = path.join(dataDir, "projects.json");
const templatesPath = path.join(dataDir, "templates.json");
const areasPath = path.join(dataDir, "areas.json");
const tasksPath = path.join(dataDir, "tasks.json");
const responsibilitiesPath = path.join(dataDir, "responsibilities.json");
const usersPath = path.join(dataDir, "users.json");

// Helper to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper to map estado to status
function mapEstadoToStatus(estado) {
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

// Read JSON files
function readJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

// Write JSON files
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Get or create user
function getOrCreateUser(name, users) {
  let user = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  if (!user) {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    user = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      initials,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(user);
  }
  return user.id;
}

function main() {
  console.log("Creating 'La Itaba' Property Management project...\n");

  // Check if project already exists
  const projects = readJson(projectsPath);
  const existingProject = projects.find((p) => p.slug === "la-itaba");
  if (existingProject) {
    console.log("✅ Project 'La Itaba' already exists!");
    console.log(`   ID: ${existingProject.id}`);
    console.log(`   Slug: ${existingProject.slug}`);
    return;
  }

  // Load template
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template file not found: ${templatePath}`);
    process.exit(1);
  }

  const templateData = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
  const templateName = Object.keys(templateData)[0];
  const templateAreas = templateData[templateName].Areas;

  // Load existing data
  const users = readJson(usersPath);
  const areas = readJson(areasPath);
  const tasks = readJson(tasksPath);
  const responsibilities = readJson(responsibilitiesPath);
  const templates = readJson(templatesPath);

  // Create project
  const projectId = `${Date.now()}`;
  const project = {
    id: projectId,
    name: "La Itaba",
    slug: "la-itaba",
    type: "Property",
    status: "Active",
    description: "Property management for La Itaba residential property",
    participantIds: users.length > 0 ? [users[0].id] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.push(project);
  console.log(`✅ Created project: ${project.name} (${project.id})`);

  // Process areas
  let areaOrder = 1;
  Object.entries(templateAreas).forEach(([areaName, areaData]) => {
    const areaId = `area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get lead (first user or empty)
    const leadId = users.length > 0 ? users[0].id : "";

    const area = {
      id: areaId,
      projectId: projectId,
      name: areaName,
      description: null,
      leadId: leadId,
      participantIds: [],
      order: areaOrder++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    areas.push(area);
    console.log(`  ✅ Created area: ${areaName}`);

    // Process responsibilities
    const responsabilidades = areaData.Responsabilidades || [];
    if (responsabilidades.length === 0) {
      // Create default responsibility
      const respId = `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const responsibility = {
        id: respId,
        areaId: areaId,
        name: "Tareas",
        description: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      responsibilities.push(responsibility);

      // Create tasks
      areaData.Tareas.forEach((tarea) => {
        const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const task = {
          id: taskId,
          areaId: areaId,
          projectId: projectId,
          title: tarea.tarea,
          description: null,
          assigneeId: null,
          deadline: null,
          status: mapEstadoToStatus(tarea.estado),
          supportResources: null,
          templateId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        tasks.push(task);
      });
    } else {
      // Create one responsibility per responsibility name
      responsabilidades.forEach((respName) => {
        const respId = `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const responsibility = {
          id: respId,
          areaId: areaId,
          name: respName,
          description: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        responsibilities.push(responsibility);

        // Create tasks for this responsibility
        areaData.Tareas.forEach((tarea) => {
          const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const task = {
            id: taskId,
            areaId: areaId,
            projectId: projectId,
            title: tarea.tarea,
            description: null,
            assigneeId: null,
            deadline: null,
            status: mapEstadoToStatus(tarea.estado),
            supportResources: null,
            templateId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          tasks.push(task);
        });
      });
    }
  });

  // Save all data
  writeJson(projectsPath, projects);
  writeJson(areasPath, areas);
  writeJson(tasksPath, tasks);
  writeJson(responsibilitiesPath, responsibilities);
  writeJson(usersPath, users);

  const createdAreas = areas.filter((a) => a.projectId === projectId);
  const createdTasks = tasks.filter((t) => t.projectId === projectId);

  console.log(`\n✅ Project 'La Itaba' created successfully!`);
  console.log(`   - Areas: ${createdAreas.length}`);
  console.log(`   - Tasks: ${createdTasks.length}`);
  console.log(`   - Responsibilities: ${responsibilities.filter((r) => createdAreas.some((a) => a.id === r.areaId)).length}`);
}

main();

