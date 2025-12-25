import { NextRequest, NextResponse } from "next/server";
import { updateMeetingNote } from "@/lib/data-supabase";

interface RouteParams {
  params: Promise<{ noteId: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { noteId } = await params;
    const body = await request.json();
    const { content, agenda, decisions, actionItems } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Meeting note content is required" }, { status: 400 });
    }

    const updatePayload: Partial<{
      content: string;
      agenda?: string;
      decisions?: string;
      actionItems?: string[];
    }> = {
      content: content.trim(),
      ...(agenda !== undefined && { agenda: agenda.trim() || undefined }),
      ...(decisions !== undefined && { decisions: decisions.trim() || undefined }),
      ...(actionItems !== undefined && {
        actionItems: Array.isArray(actionItems) && actionItems.length > 0 ? actionItems : undefined,
      }),
    };

    const updatedNote = await updateMeetingNote(noteId, updatePayload);
    if (!updatedNote) {
      return NextResponse.json({ error: "Meeting note not found" }, { status: 404 });
    }

    return NextResponse.json(updatedNote, { status: 200 });
  } catch (error) {
    console.error("Error updating meeting note:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update meeting note";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

