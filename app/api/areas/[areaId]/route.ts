import { NextRequest, NextResponse } from "next/server";
import { deleteArea, getAreaById, updateArea } from "@/lib/data";

interface RouteParams {
  params: Promise<{ areaId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { areaId } = await params;

    const area = getAreaById(areaId);
    if (!area) {
      return NextResponse.json(
        { error: "Area not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(area, { status: 200 });
  } catch (error) {
    console.error("Error fetching area:", error);
    return NextResponse.json(
      { error: "Failed to fetch area" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { areaId } = await params;
    const body = await request.json();
    const { name, description, leadId } = body;

    // Check if area exists
    const existingArea = getAreaById(areaId);
    if (!existingArea) {
      return NextResponse.json(
        { error: "Area not found" },
        { status: 404 }
      );
    }

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Area name is required" },
        { status: 400 }
      );
    }

    // Update area
    const updatedArea = updateArea(areaId, {
      name: name.trim(),
      description: description?.trim() || undefined,
      leadId: leadId || "",
    });

    if (!updatedArea) {
      return NextResponse.json(
        { error: "Failed to update area" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedArea, { status: 200 });
  } catch (error) {
    console.error("Error updating area:", error);
    return NextResponse.json(
      { error: "Failed to update area" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { areaId } = await params;

    // Check if area exists
    const existingArea = getAreaById(areaId);
    if (!existingArea) {
      return NextResponse.json(
        { error: "Area not found" },
        { status: 404 }
      );
    }

    // Delete area (this will also delete all associated tasks)
    const deleted = deleteArea(areaId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete area" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting area:", error);
    return NextResponse.json(
      { error: "Failed to delete area" },
      { status: 500 }
    );
  }
}

