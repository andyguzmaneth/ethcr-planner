import { NextRequest, NextResponse } from "next/server";
import { createArea, reorderAreas } from "@/lib/data-supabase";
import { handleApiError, validateRequiredString } from "../utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, eventId, name, description, leadId } = body;

    // Support both projectId and eventId for backward compatibility
    const finalProjectId = projectId || eventId;

    // Validation
    if (!finalProjectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const validName = validateRequiredString(name, "name");
    if (!validName) {
      return NextResponse.json({ error: "Area name is required" }, { status: 400 });
    }

    const area = await createArea({
      projectId: finalProjectId,
      name: validName,
      description: description?.trim() || undefined,
      leadId: leadId || undefined,
      participantIds: [], // Participants will be added automatically as tasks are assigned
    });

    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    return handleApiError(error, "creating area", "Failed to create area");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, eventId, areaOrders } = body;

    // Support both projectId and eventId for backward compatibility
    const finalProjectId = projectId || eventId;

    // Validation
    if (!finalProjectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
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
    const success = await reorderAreas(finalProjectId, areaOrders);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to reorder areas" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "reordering areas", "Failed to reorder areas");
  }
}

