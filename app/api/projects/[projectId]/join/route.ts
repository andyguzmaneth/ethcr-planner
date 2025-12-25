import { NextRequest, NextResponse } from "next/server";
import { joinProject, leaveProject } from "@/lib/data-supabase";

// TODO For now, we'll use a hardcoded user ID. In a real app, get from auth session
const CURRENT_USER_ID = "00000000-0000-0000-0000-000000000001"; // Example UUID

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const project = await joinProject(projectId, CURRENT_USER_ID);

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
    const project = await leaveProject(projectId, CURRENT_USER_ID);

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

