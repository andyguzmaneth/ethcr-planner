import { NextRequest, NextResponse } from "next/server";
import { createArea } from "@/lib/data";

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
        { error: "Area name is required" },
        { status: 400 }
      );
    }

    // Create area
    const area = createArea({
      eventId,
      name: name.trim(),
      description: description?.trim() || undefined,
      leadId: leadId || "",
      participantIds: [], // Participants will be added automatically as tasks are assigned
    });

    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    console.error("Error creating area:", error);
    return NextResponse.json(
      { error: "Failed to create area" },
      { status: 500 }
    );
  }
}

