import { NextRequest, NextResponse } from "next/server";
import { deleteArea, getAreaById, updateArea } from "@/lib/data-supabase";
import { handleApiError, notFoundResponse, validateRequiredString } from "../../utils";

interface RouteParams {
  params: Promise<{ areaId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { areaId } = await params;
    const area = await getAreaById(areaId);
    if (!area) {
      return notFoundResponse("Area");
    }
    return NextResponse.json(area, { status: 200 });
  } catch (error) {
    return handleApiError(error, "fetching area", "Failed to fetch area");
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

    const existingArea = await getAreaById(areaId);
    if (!existingArea) {
      return notFoundResponse("Area");
    }

    const validName = validateRequiredString(name, "name");
    if (!validName) {
      return NextResponse.json({ error: "Area name is required" }, { status: 400 });
    }

    const updatedArea = await updateArea(areaId, {
      name: validName,
      description: description?.trim() || undefined,
      leadId: leadId || undefined,
    });

    if (!updatedArea) {
      return NextResponse.json({ error: "Failed to update area" }, { status: 500 });
    }

    return NextResponse.json(updatedArea, { status: 200 });
  } catch (error) {
    return handleApiError(error, "updating area", "Failed to update area");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { areaId } = await params;
    const existingArea = await getAreaById(areaId);
    if (!existingArea) {
      return notFoundResponse("Area");
    }

    const deleted = await deleteArea(areaId);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete area" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "deleting area", "Failed to delete area");
  }
}

