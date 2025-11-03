import { NextRequest, NextResponse } from "next/server";
import { createTrack } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, name, description, leadId } = body;

    // Validation
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Track name is required" },
        { status: 400 }
      );
    }

    // Create track
    const track = createTrack({
      eventId,
      name: name.trim(),
      description: description?.trim() || undefined,
      leadId: leadId || "",
      participantIds: [], // Participants will be added automatically as tasks are assigned
    });

    return NextResponse.json(track, { status: 201 });
  } catch (error) {
    console.error("Error creating track:", error);
    return NextResponse.json(
      { error: "Failed to create track" },
      { status: 500 }
    );
  }
}

