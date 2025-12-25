import { NextRequest, NextResponse } from "next/server";
import { createMeeting } from "@/lib/data-supabase";
import { validateUUID } from "../tasks/utils";
import { validateMeetingInput } from "./utils";

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

    const validation = validateMeetingInput(title, date, time, attendeeIds);
    if (!validation.valid) {
      return validation.error!;
    }

    const meeting = await createMeeting({
      projectId: validProjectId,
      ...validation.data!,
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create meeting";
    const statusCode = errorMessage.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

