import { NextRequest, NextResponse } from "next/server";
import { updateMeeting, getMeetingById, deleteMeeting } from "@/lib/data-supabase";
import { validateMeetingInput } from "../utils";

interface RouteParams {
  params: Promise<{ meetingId: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { meetingId } = await params;
    const body = await request.json();
    const { title, date, time, attendeeIds } = body;

    const existingMeeting = await getMeetingById(meetingId);
    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const validation = validateMeetingInput(title, date, time, attendeeIds);
    if (!validation.valid) {
      return validation.error!;
    }

    const updatedMeeting = await updateMeeting(meetingId, validation.data!);
    if (!updatedMeeting) {
      return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
    }

    return NextResponse.json(updatedMeeting, { status: 200 });
  } catch (error) {
    console.error("Error updating meeting:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update meeting";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { meetingId } = await params;

    const existingMeeting = await getMeetingById(meetingId);
    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const deleted = await deleteMeeting(meetingId);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete meeting";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

