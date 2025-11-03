import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, areaId, title, description, assigneeId, deadline, status, supportResources } = body;

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

    // Parse support resources from textarea (one per line)
    let parsedSupportResources: string[] = [];
    if (supportResources && typeof supportResources === "string") {
      parsedSupportResources = supportResources
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } else if (Array.isArray(supportResources)) {
      parsedSupportResources = supportResources;
    }

    // Create task
    const task = createTask({
      eventId,
      areaId: areaId || undefined,
      title: title.trim(),
      description: description?.trim() || undefined,
      assigneeId: assigneeId || undefined,
      deadline: deadline || undefined,
      status: status || "pending",
      supportResources: parsedSupportResources.length > 0 ? parsedSupportResources : undefined,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

