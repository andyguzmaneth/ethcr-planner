import fs from "fs";
import path from "path";
import { loadTemplateFromJson } from "../templates";
import { createTemplate } from "../data-supabase";

/**
 * Script to initialize the ETH Pura Vida template from the JSON file
 * Run with: npx tsx -r dotenv/config lib/scripts/init-eth-pura-vida-template.ts
 */

const dataDir = path.join(process.cwd(), "data");
const jsonFilePath = path.join(dataDir, "ETH_Pura_Vida_Project_Structure_v2.json");

function main() {
  console.log("Loading ETH Pura Vida template from JSON...");

  // Read the JSON file
  const jsonContent = fs.readFileSync(jsonFilePath, "utf-8");
  const jsonData = JSON.parse(jsonContent);

  // Convert to template format
  const templates = loadTemplateFromJson(jsonData, "Conference");

  if (templates.length === 0) {
    console.error("No templates found in JSON file");
    process.exit(1);
  }

  // Create template file (or update existing)
  const template = templates[0];
  console.log(`Found template: ${template.name}`);
  console.log(`  - Areas: ${template.areas.length}`);
  console.log(
    `  - Total Tasks: ${template.areas.reduce(
      (sum, area) =>
        sum +
        area.responsibilities.reduce(
          (s, resp) => s + resp.tasks.length,
          0
        ),
      0
    )}`
  );

  // Save to templates.json
  const templatesFilePath = path.join(dataDir, "templates.json");
  let existingTemplates: typeof template[] = [];

  if (fs.existsSync(templatesFilePath)) {
    const existingContent = fs.readFileSync(templatesFilePath, "utf-8");
    existingTemplates = JSON.parse(existingContent);
  }

  // Check if template already exists
  const existingIndex = existingTemplates.findIndex(
    (t) => t.name === template.name
  );

  if (existingIndex >= 0) {
    console.log(`Template "${template.name}" already exists. Updating...`);
    existingTemplates[existingIndex] = template;
  } else {
    console.log(`Creating new template "${template.name}"...`);
    existingTemplates.push(template);
  }

  fs.writeFileSync(
    templatesFilePath,
    JSON.stringify(existingTemplates, null, 2),
    "utf-8"
  );

  console.log(`✅ Template saved to ${templatesFilePath}`);
  console.log("\nYou can now use this template to initialize events!");
}

main();

