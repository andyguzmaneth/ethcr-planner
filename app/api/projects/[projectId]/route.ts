import { NextRequest, NextResponse } from "next/server";
import { getProjectById, updateProject } from "@/lib/data-supabase";
import type { ProjectType, ProjectStatus } from "@/lib/types";
import { handleApiError, notFoundResponse, validateRequiredString } from "../../utils";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

const VALID_PROJECT_TYPES: ProjectType[] = ["Meetup", "Conference", "Property", "Custom"];
const VALID_PROJECT_STATUSES: ProjectStatus[] = ["In Planning", "Active", "Completed", "Cancelled"];

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project) {
      return notFoundResponse("Project");
    }
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    return handleApiError(error, "fetching project", "Failed to fetch project");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { name, type, status, description, startDate, endDate } = body;

    const existingProject = await getProjectById(projectId);
    if (!existingProject) {
      return notFoundResponse("Project");
    }

    if (name !== undefined) {
      const validName = validateRequiredString(name, "name");
      if (!validName) {
        return NextResponse.json({ error: "Project name is required" }, { status: 400 });
      }
    }

    if (type !== undefined && !VALID_PROJECT_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid project type" }, { status: 400 });
    }

    if (status !== undefined && !VALID_PROJECT_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid project status" }, { status: 400 });
    }

    const validName = name !== undefined ? validateRequiredString(name, "name") : undefined;
    const updatedProject = await updateProject(projectId, {
      ...(validName && { name: validName }),
      ...(type !== undefined && { type: type as ProjectType }),
      ...(status !== undefined && { status: status as ProjectStatus }),
      ...(description !== undefined && { description: description?.trim() || undefined }),
      ...(startDate !== undefined && { startDate: startDate || undefined }),
      ...(endDate !== undefined && { endDate: endDate || undefined }),
    });

    if (!updatedProject) {
      return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    return handleApiError(error, "updating project", "Failed to update project");
  }
}

