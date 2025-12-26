import { NextRequest, NextResponse } from "next/server";
import { joinProject, leaveProject } from "@/lib/data-supabase";
import { getCurrentUserId } from "@/lib/utils/server-helpers";
import type { Project } from "@/lib/types";
import { handleApiError, notFoundResponse } from "../../../utils";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

async function handleProjectAction(
  projectId: string,
  action: (projectId: string, userId: string) => Promise<Project | null>
) {
  const currentUserId = await getCurrentUserId();
  const project = await action(projectId, currentUserId);

  if (!project) {
    return notFoundResponse("Project");
  }

  return NextResponse.json({ success: true, project });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    return await handleProjectAction(projectId, joinProject);
  } catch (error) {
    return handleApiError(error, "joining project", "Failed to join project");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    return await handleProjectAction(projectId, leaveProject);
  } catch (error) {
    return handleApiError(error, "leaving project", "Failed to leave project");
  }
}

