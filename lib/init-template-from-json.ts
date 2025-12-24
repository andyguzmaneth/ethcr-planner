/**
 * Utility to initialize a template from JSON and optionally create an event from it
 * This can be used programmatically or imported in other scripts
 */

import "server-only";
import fs from "fs";
import path from "path";
import { loadTemplateFromJson, initializeProjectFromTemplate } from "./templates";
import { createTemplate, getTemplateByName, updateTemplate, getTemplates, getTemplateById } from "./data";
import type { ProjectTemplate } from "./types";

const dataDir = path.join(process.cwd(), "data");

/**
 * Initialize ETH Pura Vida template from JSON file
 */
export function initEthPuraVidaTemplate(): ProjectTemplate {
  const jsonFilePath = path.join(dataDir, "ETH_Pura_Vida_Project_Structure_v2.json");
  
  if (!fs.existsSync(jsonFilePath)) {
    throw new Error(`Template JSON file not found: ${jsonFilePath}`);
  }

  const jsonContent = fs.readFileSync(jsonFilePath, "utf-8");
  const jsonData = JSON.parse(jsonContent);

  const templates = loadTemplateFromJson(jsonData, "Conference");

  if (templates.length === 0) {
    throw new Error("No templates found in JSON file");
  }

  const template = templates[0];
  
  // Check if template already exists
  const existingTemplate = getTemplateByName(template.name);
  
  let savedTemplate: ProjectTemplate;
  if (existingTemplate) {
    // Update existing template
    const updated = updateTemplate(existingTemplate.id, {
      areas: template.areas,
      description: template.description,
    });
    if (!updated) {
      throw new Error(`Failed to update template: ${existingTemplate.id}`);
    }
    savedTemplate = updated;
    console.log(`✅ Template "${savedTemplate.name}" updated with ID: ${savedTemplate.id}`);
  } else {
    // Create new template
    savedTemplate = createTemplate({
      name: template.name,
      projectType: template.projectType,
      description: template.description,
      areas: template.areas,
    });
    console.log(`✅ Template "${savedTemplate.name}" created with ID: ${savedTemplate.id}`);
  }
  
  console.log(`  - Areas: ${savedTemplate.areas.length}`);
  
  const totalTasks = savedTemplate.areas.reduce(
    (sum, area) =>
      sum +
      area.responsibilities.reduce((s, resp) => s + resp.tasks.length, 0),
    0
  );
  console.log(`  - Total Tasks: ${totalTasks}`);

  return savedTemplate;
}

/**
 * Initialize a project from the ETH Pura Vida template
 */
export function initProjectFromEthPuraVidaTemplate(projectDetails: {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}) {
  // Ensure template exists
  let template = getTemplateByName("ETH Pura Vida");
  if (!template) {
    template = initEthPuraVidaTemplate();
  }
  
  const result = initializeProjectFromTemplate(template, projectDetails, {
    assignTeamMembers: true,
  });

  console.log(`✅ Project "${result.project.name}" created with ID: ${result.project.id}`);
  console.log(`  - Areas: ${result.areas.length}`);
  console.log(`  - Responsibilities: ${result.responsibilities.length}`);
  console.log(`  - Tasks: ${result.tasks.length}`);

  return result;
}

// Legacy alias for backward compatibility
export const initEventFromEthPuraVidaTemplate = initProjectFromEthPuraVidaTemplate;

// If run directly, initialize the template
if (require.main === module) {
  try {
    initEthPuraVidaTemplate();
  } catch (error) {
    console.error("Error initializing template:", error);
    process.exit(1);
  }
}

