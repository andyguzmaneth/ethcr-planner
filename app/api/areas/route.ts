import { NextRequest, NextResponse } from "next/server";
import { createArea, reorderAreas } from "@/lib/data";

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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, areaOrders } = body;

    // Validation
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(areaOrders)) {
      return NextResponse.json(
        { error: "areaOrders must be an array" },
        { status: 400 }
      );
    }

    // Validate each area order entry
    for (const ao of areaOrders) {
      if (!ao.id || typeof ao.id !== "string") {
        return NextResponse.json(
          { error: "Each area order must have a valid id" },
          { status: 400 }
        );
      }
      if (typeof ao.order !== "number") {
        return NextResponse.json(
          { error: "Each area order must have a valid order number" },
          { status: 400 }
        );
      }
    }

    // Reorder areas
    const success = reorderAreas(eventId, areaOrders);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to reorder areas" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error reordering areas:", error);
    return NextResponse.json(
      { error: "Failed to reorder areas" },
      { status: 500 }
    );
  }
}

