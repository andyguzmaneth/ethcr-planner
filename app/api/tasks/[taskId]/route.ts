import { NextRequest, NextResponse } from "next/server";
import { updateTask, getTaskById, deleteTask } from "@/lib/data";

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
    const { eventId, areaId, title, description, assigneeId, deadline, status, supportResources } = body;

    // Check if task exists
    const existingTask = getTaskById(taskId);
    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Validation
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // Parse support resources from textarea (one per line) or array
    let parsedSupportResources: string[] = [];
    if (supportResources && typeof supportResources === "string") {
      parsedSupportResources = supportResources
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } else if (Array.isArray(supportResources)) {
      parsedSupportResources = supportResources;
    }

    // Update task
    const updatedTask = updateTask(taskId, {
      eventId,
      areaId: areaId || undefined,
      title: title.trim(),
      description: description?.trim() || undefined,
      assigneeId: assigneeId || undefined,
      deadline: deadline || undefined,
      status: status || existingTask.status,
      supportResources: parsedSupportResources.length > 0 ? parsedSupportResources : undefined,
    });

    if (!updatedTask) {
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { taskId } = await params;

    // Check if task exists
    const existingTask = getTaskById(taskId);
    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Delete task
    const deleted = deleteTask(taskId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

