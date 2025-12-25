"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, FileText, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NewMeetingModal } from "@/components/projects/new-meeting-modal";
import { DeleteMeetingDialog } from "@/components/projects/delete-meeting-dialog";
import type { EnrichedMeeting } from "@/lib/utils/meeting-helpers";
import type { Meeting } from "@/lib/types";

type MeetingWithDetails = EnrichedMeeting;

interface MeetingsClientProps {
  projectId: string;
  projectSlug: string;
  projectName: string;
  initialMeetings: MeetingWithDetails[];
  users: Array<{
    id: string;
    name: string;
    initials: string;
    email?: string;
  }>;
  hideHeader?: boolean;
}

export function MeetingsClient({
  projectId,
  projectSlug,
  projectName,
  initialMeetings,
  users,
  hideHeader = false,
}: MeetingsClientProps) {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingWithDetails[]>(initialMeetings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update meetings when initialMeetings changes (after refresh)
  useEffect(() => {
    setMeetings(initialMeetings);
  }, [initialMeetings]);

  // Refresh meetings when modal closes
  const handleModalSuccess = () => {
    router.refresh();
  };

  const handleCreateClick = () => {
    setEditingMeeting(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, meeting: Meeting) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, meeting: Meeting) => {
    e.preventDefault();
    e.stopPropagation();
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/meetings/${meetingToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete meeting");
      }

      setDeleteDialogOpen(false);
      setMeetingToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert(error instanceof Error ? error.message : "Failed to delete meeting");
    } finally {
      setIsDeleting(false);
    }
  };

  const createButton = (
    <Button onClick={handleCreateClick}>
      <Plus className="mr-2 h-4 w-4" />
      Crear Notas de Reunión
    </Button>
  );

  return (
    <div className={hideHeader ? "space-y-4" : "container mx-auto p-6 space-y-6"}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Reuniones - {projectName}
            </h1>
            <p className="text-muted-foreground mt-2">
              Ver y gestionar las notas de reuniones de este proyecto
            </p>
          </div>
          {createButton}
        </div>
      )}
      
      {hideHeader && (
        <div className="flex items-center justify-end">
          {createButton}
        </div>
      )}

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No hay reuniones programadas</p>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Crea tu primera reunión
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-lg transition-shadow relative group">
              <Link href={`/projects/${projectSlug}/meetings/${meeting.id}`} className="block">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <CardDescription>{projectName}</CardDescription>
                    </div>
                    {meeting.hasNotes && (
                      <Badge variant="outline">
                        <FileText className="mr-1 h-3 w-3" />
                        Tiene Notas
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {meeting.date} a las {meeting.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Asistentes:</span>
                      <div className="flex -space-x-2">
                        {meeting.attendees.map((attendee, idx) => (
                          <Avatar key={idx} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={attendee?.avatar || ""} alt={attendee?.name || ""} />
                            <AvatarFallback className="text-xs">
                              {attendee?.initials || "?"}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Link>
              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => handleEditClick(e, meeting)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => handleDeleteClick(e, meeting)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NewMeetingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        meeting={editingMeeting}
        projectId={projectId}
        projectName={projectName}
        users={users}
        onSuccess={handleModalSuccess}
      />

      {meetingToDelete && (
        <DeleteMeetingDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          meetingTitle={meetingToDelete.title}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

