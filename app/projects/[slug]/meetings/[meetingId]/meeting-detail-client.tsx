"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Pencil, Trash2, FileText, Calendar, Clock, Users, Plus } from "lucide-react";
import Link from "next/link";
import { NewMeetingModal } from "@/components/projects/new-meeting-modal";
import { DeleteMeetingDialog } from "@/components/projects/delete-meeting-dialog";
import { MeetingNotesModal } from "@/components/projects/meeting-notes-modal";
import type { Meeting, MeetingNote, Project, User } from "@/lib/types";

interface MeetingDetailClientProps {
  meeting: Meeting;
  project: Project;
  notes: MeetingNote | undefined;
  attendees: (User | null)[];
  users: Array<{
    id: string;
    name: string;
    initials: string;
    email?: string;
  }>;
}

export function MeetingDetailClient({
  meeting,
  project,
  notes,
  attendees,
  users,
}: MeetingDetailClientProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const handleEditSuccess = () => {
    router.refresh();
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete meeting");
      }

      router.push(`/projects/${project.slug}/meetings`);
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert(error instanceof Error ? error.message : "Failed to delete meeting");
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${project.slug}/meetings`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{meeting.title}</h1>
              <p className="text-muted-foreground mt-1">{project.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground ml-12">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{meeting.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{meeting.time}</span>
            </div>
            {attendees.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{attendees.length} attendee(s)</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Attendees */}
      {attendees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Attendees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {attendees.map((attendee) => (
                <div key={attendee?.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={attendee?.avatar || ""} alt={attendee?.name || ""} />
                    <AvatarFallback>{attendee?.initials || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{attendee?.name || "Unknown"}</p>
                    {attendee?.email && (
                      <p className="text-sm text-muted-foreground">{attendee.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meeting Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Meeting Notes
              </CardTitle>
              <CardDescription>
                {notes ? "Notes from this meeting" : "No notes have been added to this meeting yet"}
              </CardDescription>
            </div>
            <Button
              variant={notes ? "outline" : "default"}
              onClick={() => setIsNotesModalOpen(true)}
            >
              {notes ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Notes
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Notes
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notes ? (
            <div className="space-y-4">
              {notes.agenda && (
                <div>
                  <h3 className="font-semibold mb-2">Agenda</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes.agenda}</p>
                </div>
              )}
              {notes.content && (
                <div>
                  <h3 className="font-semibold mb-2">Content</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes.content}</p>
                </div>
              )}
              {notes.decisions && (
                <div>
                  <h3 className="font-semibold mb-2">Decisions</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes.decisions}</p>
                </div>
              )}
              {notes.actionItems && notes.actionItems.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Action Items</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {notes.actionItems.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No notes available for this meeting.</p>
          )}
        </CardContent>
      </Card>

      <NewMeetingModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        meeting={meeting}
        projectId={project.id}
        projectName={project.name}
        users={users}
        onSuccess={handleEditSuccess}
      />

      <DeleteMeetingDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        meetingTitle={meeting.title}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <MeetingNotesModal
        open={isNotesModalOpen}
        onOpenChange={setIsNotesModalOpen}
        meetingId={meeting.id}
        note={notes}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

