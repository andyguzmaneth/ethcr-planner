import { NextRequest, NextResponse } from "next/server";
import { updateTask, getTaskById, deleteTask } from "@/lib/data-supabase";
import type { Task } from "@/lib/types";
import { parseSupportResources } from "../utils";

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const { title, description, assigneeId, deadline, status, supportResources, dependsOn, isRecurring, recurrence } = body;

    const existingTask = await getTaskById(taskId);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const updatePayload: Partial<Task> = {
      title: title.trim(),
      ...(description !== undefined && { description: description.trim() || undefined }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || undefined }),
      ...(deadline !== undefined && { deadline: deadline || undefined }),
      ...(status && { status }),
      ...(supportResources !== undefined && { supportResources: parseSupportResources(supportResources) }),
      ...(dependsOn !== undefined && {
        dependsOn: Array.isArray(dependsOn) && dependsOn.length > 0 ? dependsOn : undefined,
      }),
      ...(isRecurring !== undefined && { isRecurring }),
      ...(recurrence !== undefined && { recurrence: recurrence || undefined }),
    };

    const updatedTask = await updateTask(taskId, updatePayload);
    if (!updatedTask) {
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update task";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { taskId } = await params;

    const existingTask = await getTaskById(taskId);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const deleted = await deleteTask(taskId);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete task";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

