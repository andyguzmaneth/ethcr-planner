import { NextRequest, NextResponse } from "next/server";
import { joinProject, leaveProject } from "@/lib/data-supabase";
import { getCurrentUserId } from "@/lib/utils/server-helpers";
import type { Project } from "@/lib/types";

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
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, project });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    return await handleProjectAction(projectId, joinProject);
  } catch (error) {
    console.error("Error joining project:", error);
    return NextResponse.json({ error: "Failed to join project" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    return await handleProjectAction(projectId, leaveProject);
  } catch (error) {
    console.error("Error leaving project:", error);
    return NextResponse.json({ error: "Failed to leave project" }, { status: 500 });
  }
}

