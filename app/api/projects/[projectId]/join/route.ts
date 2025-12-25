import { NextRequest, NextResponse } from "next/server";
import { joinProject, leaveProject } from "@/lib/data-supabase";
import { getCurrentUserId } from "@/lib/utils/server-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const currentUserId = getCurrentUserId();
    const project = await joinProject(projectId, currentUserId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Error joining project:", error);
    return NextResponse.json(
      { error: "Failed to join project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const currentUserId = getCurrentUserId();
    const project = await leaveProject(projectId, currentUserId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Error leaving project:", error);
    return NextResponse.json(
      { error: "Failed to leave project" },
      { status: 500 }
    );
  }
}

