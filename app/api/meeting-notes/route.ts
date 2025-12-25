import { NextRequest, NextResponse } from "next/server";
import { createMeetingNote } from "@/lib/data-supabase";
import { getCurrentUserId } from "@/lib/utils/server-helpers";
import { validateUUID } from "../tasks/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetingId, content, agenda, decisions, actionItems } = body;

    if (!meetingId?.trim()) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    const validMeetingId = validateUUID(meetingId.trim(), "meetingId");
    if (!validMeetingId) {
      return NextResponse.json({ error: "Invalid meetingId: must be a valid UUID" }, { status: 400 });
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: "Meeting note content is required" }, { status: 400 });
    }

    const currentUserId = await getCurrentUserId();

    const note = await createMeetingNote({
      meetingId: validMeetingId,
      content: content.trim(),
      agenda: agenda?.trim() || undefined,
      decisions: decisions?.trim() || undefined,
      actionItems: Array.isArray(actionItems) && actionItems.length > 0 ? actionItems : undefined,
      createdBy: currentUserId,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting note:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create meeting note";
    const statusCode = errorMessage.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

