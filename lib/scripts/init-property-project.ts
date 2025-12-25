import fs from "fs";
import path from "path";
import { loadTemplateFromJson, initializeProjectFromTemplate } from "../templates";
import { createTemplate, getTemplateByName } from "../data-supabase";

/**
 * Script to initialize a Property project from the residential property template
 * Run with: node --loader ts-node/esm lib/scripts/init-property-project.ts
 * Or: npx tsx lib/scripts/init-property-project.ts
 */

const dataDir = path.join(process.cwd(), "data");
const jsonFilePath = path.join(dataDir, "residential-property-template.json");

async function initResidentialPropertyTemplate() {
  console.log("Loading Residential Property template from JSON...");

  if (!fs.existsSync(jsonFilePath)) {
    throw new Error(`Template JSON file not found: ${jsonFilePath}`);
  }

  // Read the JSON file
  const jsonContent = fs.readFileSync(jsonFilePath, "utf-8");
  const jsonData = JSON.parse(jsonContent);

  // Convert to template format
  const templates = loadTemplateFromJson(jsonData, "Property");

  if (templates.length === 0) {
    throw new Error("No templates found in JSON file");
  }

  const template = templates[0];
  console.log(`Found template: ${template.name}`);
  console.log(`  - Areas: ${template.areas.length}`);

  const totalTasks = template.areas.reduce(
    (sum, area) =>
      sum +
      area.responsibilities.reduce((s, resp) => s + resp.tasks.length, 0),
    0
  );
  console.log(`  - Total Tasks: ${totalTasks}`);

  // Check if template already exists
  const existingTemplate = await getTemplateByName(template.name);

  let savedTemplate;
  if (existingTemplate) {
    console.log(`Template "${template.name}" already exists.`);
    savedTemplate = existingTemplate;
  } else {
    // Create new template
    savedTemplate = await createTemplate({
      name: template.name,
      projectType: template.projectType,
      description: template.description,
      areas: template.areas,
    });
    console.log(`✅ Template "${savedTemplate.name}" created with ID: ${savedTemplate.id}`);
  }

  return savedTemplate;
}

async function createLaItabaProject() {
  console.log("\nCreating 'La Itaba' Property Management project...");

  // Ensure template exists
  let template = await getTemplateByName("Residential Property Management");
  if (!template) {
    template = await initResidentialPropertyTemplate();
  }

  // Create the project
  const result = await initializeProjectFromTemplate(
    template,
    {
      name: "La Itaba",
      description: "Property management for La Itaba residential property",
    },
    {
      assignTeamMembers: true,
    }
  );

  console.log(`✅ Project "${result.project.name}" created with ID: ${result.project.id}`);
  console.log(`  - Type: ${result.project.type}`);
  console.log(`  - Status: ${result.project.status}`);
  console.log(`  - Areas: ${result.areas.length}`);
  console.log(`  - Responsibilities: ${result.responsibilities.length}`);
  console.log(`  - Tasks: ${result.tasks.length}`);

  console.log("\nAreas created:");
  result.areas.forEach((area) => {
    const areaTasks = result.tasks.filter((t) => t.areaId === area.id);
    console.log(`  - ${area.name} (${areaTasks.length} tasks)`);
  });

  return result;
}

async function main() {
  try {
    await createLaItabaProject();
    console.log("\n✅ Property project 'La Itaba' successfully created!");
  } catch (error) {
    console.error("Error creating property project:", error);
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

