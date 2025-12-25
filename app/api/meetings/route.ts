import { NextRequest, NextResponse } from "next/server";
import { createMeeting } from "@/lib/data-supabase";
import { validateUUID } from "../tasks/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, title, date, time, attendeeIds } = body;

    if (!projectId?.trim()) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const validProjectId = validateUUID(projectId.trim(), "projectId");
    if (!validProjectId) {
      return NextResponse.json({ error: "Invalid projectId: must be a valid UUID" }, { status: 400 });
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: "Meeting title is required" }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: "Meeting date is required" }, { status: 400 });
    }

    if (!time) {
      return NextResponse.json({ error: "Meeting time is required" }, { status: 400 });
    }

    // Validate attendee IDs if provided
    const validAttendeeIds = attendeeIds && Array.isArray(attendeeIds) 
      ? attendeeIds.map((id: string) => validateUUID(id, "attendeeId")).filter(Boolean) as string[]
      : [];

    const meeting = await createMeeting({
      projectId: validProjectId,
      title: title.trim(),
      date: date,
      time: time,
      attendeeIds: validAttendeeIds,
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create meeting";
    const statusCode = errorMessage.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

