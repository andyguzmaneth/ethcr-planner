import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { loadTemplateFromJson, initializeProjectFromTemplate } from "@/lib/templates";
import { createTemplate, getTemplateByName, getProjectBySlug } from "@/lib/data-supabase";

export async function POST() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const jsonFilePath = path.join(dataDir, "residential-property-template.json");

    // Check if project already exists
    const existingProject = await getProjectBySlug("la-itaba");
    if (existingProject) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Project 'La Itaba' already exists",
          project: existingProject 
        },
        { status: 400 }
      );
    }

    // Load template from JSON
    if (!fs.existsSync(jsonFilePath)) {
      return NextResponse.json(
        { success: false, message: "Template file not found" },
        { status: 404 }
      );
    }

    const jsonContent = fs.readFileSync(jsonFilePath, "utf-8");
    const jsonData = JSON.parse(jsonContent);
    const templates = loadTemplateFromJson(jsonData, "Property");

    if (templates.length === 0) {
      return NextResponse.json(
        { success: false, message: "No templates found in JSON file" },
        { status: 400 }
      );
    }

    const template = templates[0];

    // Ensure template exists in database
    let savedTemplate = await getTemplateByName(template.name);
    if (!savedTemplate) {
      savedTemplate = await createTemplate({
        name: template.name,
        projectType: template.projectType,
        description: template.description,
        areas: template.areas,
      });
    }

    // Create the project
    const result = await initializeProjectFromTemplate(
      savedTemplate,
      {
        name: "La Itaba",
        description: "Property management for La Itaba residential property",
      },
      {
        assignTeamMembers: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Project 'La Itaba' created successfully",
      project: {
        id: result.project.id,
        name: result.project.name,
        slug: result.project.slug,
        type: result.project.type,
        status: result.project.status,
      },
      stats: {
        areas: result.areas.length,
        responsibilities: result.responsibilities.length,
        tasks: result.tasks.length,
      },
      areas: result.areas.map((area) => ({
        id: area.id,
        name: area.name,
        taskCount: result.tasks.filter((t) => t.areaId === area.id).length,
      })),
    });
  } catch (error) {
    console.error("Error creating La Itaba project:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

