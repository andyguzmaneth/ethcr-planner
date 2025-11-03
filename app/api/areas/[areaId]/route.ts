import { NextRequest, NextResponse } from "next/server";
import { deleteArea, getAreaById } from "@/lib/data";

interface RouteParams {
  params: Promise<{ areaId: string }>;
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

