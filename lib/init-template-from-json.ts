/**
 * Utility to initialize a template from JSON and optionally create an event from it
 * This can be used programmatically or imported in other scripts
 */

import "server-only";
import fs from "fs";
import path from "path";
import { loadTemplateFromJson, initializeEventFromTemplate } from "./templates";
import { createTemplate, getTemplateByName, updateTemplate, getTemplates, getTemplateById } from "./data";
import type { EventTemplate } from "./types";

const dataDir = path.join(process.cwd(), "data");

/**
 * Initialize ETH Pura Vida template from JSON file
 */
export function initEthPuraVidaTemplate(): EventTemplate {
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
  
  let savedTemplate: EventTemplate;
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
      eventType: template.eventType,
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
 * Initialize an event from the ETH Pura Vida template
 */
export function initEventFromEthPuraVidaTemplate(eventDetails: {
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
  
  const result = initializeEventFromTemplate(template, eventDetails, {
    assignTeamMembers: true,
  });

  console.log(`✅ Event "${result.event.name}" created with ID: ${result.event.id}`);
  console.log(`  - Areas: ${result.areas.length}`);
  console.log(`  - Responsibilities: ${result.responsibilities.length}`);
  console.log(`  - Tasks: ${result.tasks.length}`);

  return result;
}

// If run directly, initialize the template
if (require.main === module) {
  try {
    initEthPuraVidaTemplate();
  } catch (error) {
    console.error("Error initializing template:", error);
    process.exit(1);
  }
}

