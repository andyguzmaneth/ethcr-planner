"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MeetingNote } from "@/lib/types";

interface MeetingNotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  note?: MeetingNote;
  onSuccess?: () => void;
}

export function MeetingNotesModal({
  open,
  onOpenChange,
  meetingId,
  note: editingNote,
  onSuccess,
}: MeetingNotesModalProps) {
  const isEditMode = !!editingNote;

  const [content, setContent] = useState(editingNote?.content || "");
  const [agenda, setAgenda] = useState(editingNote?.agenda || "");
  const [decisions, setDecisions] = useState(editingNote?.decisions || "");
  const [actionItems, setActionItems] = useState(
    editingNote?.actionItems?.join("\n") || ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or note changes
  useEffect(() => {
    if (open && editingNote) {
      setContent(editingNote.content || "");
      setAgenda(editingNote.agenda || "");
      setDecisions(editingNote.decisions || "");
      setActionItems(editingNote.actionItems?.join("\n") || "");
      setError(null);
    } else if (open && !editingNote) {
      setContent("");
      setAgenda("");
      setDecisions("");
      setActionItems("");
      setError(null);
    }
  }, [open, editingNote]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Parse action items from textarea (one per line)
      const parsedActionItems = actionItems
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const url = editingNote
        ? `/api/meeting-notes/${editingNote.id}`
        : "/api/meeting-notes";
      const method = editingNote ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId: editingNote ? undefined : meetingId,
          content: content.trim(),
          agenda: agenda.trim() || undefined,
          decisions: decisions.trim() || undefined,
          actionItems: parsedActionItems.length > 0 ? parsedActionItems : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error ||
            (editingNote
              ? "Failed to update meeting note"
              : "Failed to create meeting note")
        );
      }

      // Reset form
      setContent("");
      setAgenda("");
      setDecisions("");
      setActionItems("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingNote
            ? "Failed to update meeting note"
            : "Failed to create meeting note"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    setAgenda("");
    setDecisions("");
    setActionItems("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Meeting Notes" : "Add Meeting Notes"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the meeting notes below."
              : "Add notes, agenda, decisions, and action items for this meeting."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Meeting notes content..."
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Agenda */}
          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea
              id="agenda"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Meeting agenda..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Decisions */}
          <div className="space-y-2">
            <Label htmlFor="decisions">Decisions</Label>
            <Textarea
              id="decisions"
              value={decisions}
              onChange={(e) => setDecisions(e.target.value)}
              placeholder="Decisions made during the meeting..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Action Items */}
          <div className="space-y-2">
            <Label htmlFor="actionItems">Action Items (one per line)</Label>
            <Textarea
              id="actionItems"
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              placeholder="Action item 1&#10;Action item 2&#10;..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Enter each action item on a new line
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Notes"
                : "Create Notes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

