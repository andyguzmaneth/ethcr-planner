import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/data-supabase";
import { parseSupportResources } from "./utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, eventId, areaId, title, description, assigneeId, deadline, status, supportResources, dependsOn, isRecurring, recurrence } = body;

    const finalProjectId = projectId || eventId;
    if (!finalProjectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = await createTask({
      projectId: finalProjectId,
      areaId: areaId || undefined,
      title: title.trim(),
      description: description?.trim() || undefined,
      assigneeId: assigneeId || undefined,
      deadline: deadline || undefined,
      status: status || "pending",
      supportResources: parseSupportResources(supportResources),
      dependsOn: Array.isArray(dependsOn) && dependsOn.length > 0 ? dependsOn : undefined,
      isRecurring: isRecurring || undefined,
      recurrence: recurrence || undefined,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create task";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

