import { NextResponse } from "next/server";
import { validateUUID } from "../tasks/utils";

export interface MeetingValidationResult {
  valid: boolean;
  error?: NextResponse;
  data?: {
    title: string;
    date: string;
    time: string;
    attendeeIds: string[];
  };
}

export function validateMeetingInput(
  title: string | undefined,
  date: string | undefined,
  time: string | undefined,
  attendeeIds: unknown
): MeetingValidationResult {
  if (!title?.trim()) {
    return {
      valid: false,
      error: NextResponse.json({ error: "Meeting title is required" }, { status: 400 }),
    };
  }

  if (!date) {
    return {
      valid: false,
      error: NextResponse.json({ error: "Meeting date is required" }, { status: 400 }),
    };
  }

  if (!time) {
    return {
      valid: false,
      error: NextResponse.json({ error: "Meeting time is required" }, { status: 400 }),
    };
  }

  const validAttendeeIds =
    attendeeIds && Array.isArray(attendeeIds)
      ? attendeeIds.map((id: string) => validateUUID(id, "attendeeId")).filter(Boolean) as string[]
      : [];

  return {
    valid: true,
    data: {
      title: title.trim(),
      date,
      time,
      attendeeIds: validAttendeeIds,
    },
  };
}

