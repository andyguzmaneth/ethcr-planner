"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { NewAreaModal } from "@/components/events/new-area-modal";
import { DeleteAreaDialog } from "@/components/events/delete-area-dialog";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface User {
  id: string;
  name: string;
  initials: string;
  email?: string;
}

interface AreaWithStats {
  id: string;
  name: string;
  description?: string;
  leadId: string;
  taskCount: number;
  completed: number;
  progress: number;
  lead: {
    id: string;
    name: string;
    initials: string;
  } | null;
}

interface EventAreasClientProps {
  eventId: string;
  eventSlug: string;
  eventName: string;
  areasWithStats: AreaWithStats[];
  users: User[];
}

export function EventAreasClient({
  eventId,
  eventSlug,
  eventName,
  areasWithStats,
  users,
}: EventAreasClientProps) {
  const router = useRouter();
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<AreaWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();

  const handleAreaCreated = () => {
    router.refresh();
  };

  const handleDeleteClick = (e: React.MouseEvent, area: AreaWithStats) => {
    e.preventDefault();
    e.stopPropagation();
    setAreaToDelete(area);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!areaToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/areas/${areaToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setAreaToDelete(null);
        router.refresh();
      } else {
        console.error("Failed to delete area");
      }
    } catch (error) {
      console.error("Error deleting area:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, area: AreaWithStats) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement edit area functionality
    console.log("Edit area:", area);
  };

  const handleCardClick = (area: AreaWithStats) => {
    window.location.href = `/events/${eventSlug}/areas/${area.id}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Areas - {eventName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todas las áreas de este evento
          </p>
        </div>
        <Button onClick={() => setIsAreaModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("eventDetail.addArea")}
        </Button>
      </div>

      {/* Areas Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {areasWithStats.map((area) => (
          <Card
            key={area.id}
            onClick={() => handleCardClick(area)}
            className="hover:shadow-lg transition-shadow cursor-pointer h-full group relative"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{area.name}</CardTitle>
                  <CardDescription>
                    Líder: {area.lead?.name || "Sin asignar"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">{t("common.actions")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleEditClick(e, area)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("common.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={(e) => handleDeleteClick(e, area)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {area.completed}/{area.taskCount} Tareas
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progreso</span>
                    <span>{area.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${area.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <NewAreaModal
        open={isAreaModalOpen}
        onOpenChange={setIsAreaModalOpen}
        eventId={eventId}
        users={users}
        onSuccess={handleAreaCreated}
      />
      {areaToDelete && (
        <DeleteAreaDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          areaName={areaToDelete.name}
          taskCount={areaToDelete.taskCount}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

