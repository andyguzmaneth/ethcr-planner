import { NextRequest, NextResponse } from "next/server";
import { updateTask, getTaskById, deleteTask } from "@/lib/data-supabase";
import type { Task } from "@/lib/types";
import { parseSupportResources, validateUUID } from "../utils";
import { handleApiError, notFoundResponse, validateRequiredString } from "../../utils";

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
      return notFoundResponse("Task");
    }

    const validTitle = validateRequiredString(title, "title");
    if (!validTitle) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const validAssigneeId = assigneeId !== undefined ? validateUUID(assigneeId, "assigneeId") : undefined;

    const updatePayload: Partial<Task> = {
      title: validTitle,
      ...(description !== undefined && { description: description.trim() || undefined }),
      ...(validAssigneeId !== undefined && { assigneeId: validAssigneeId }),
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
    return handleApiError(error, "updating task", "Failed to update task");
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
      return notFoundResponse("Task");
    }

    const deleted = await deleteTask(taskId);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "deleting task", "Failed to delete task");
  }
}

