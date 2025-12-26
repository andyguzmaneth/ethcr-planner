import { NextRequest, NextResponse } from "next/server";
import { createMeetingNote } from "@/lib/data-supabase";
import { getCurrentUserId } from "@/lib/utils/server-helpers";
import { validateUUID } from "../tasks/utils";
import { buildMeetingNotePayload } from "./utils";
import { handleApiError, validateRequiredString } from "../utils";

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

    const validContent = validateRequiredString(content, "content");
    if (!validContent) {
      return NextResponse.json({ error: "Meeting note content is required" }, { status: 400 });
    }

    const currentUserId = await getCurrentUserId();
    const payload = buildMeetingNotePayload(validContent, agenda, decisions, actionItems);

    const note = await createMeetingNote({
      meetingId: validMeetingId,
      ...payload,
      createdBy: currentUserId,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return handleApiError(error, "creating meeting note", "Failed to create meeting note");
  }
}

