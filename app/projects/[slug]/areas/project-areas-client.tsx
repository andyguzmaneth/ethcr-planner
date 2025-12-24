"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Edit, Trash2, GripVertical } from "lucide-react";
import { NewAreaModal } from "@/components/events/new-area-modal";
import { DeleteAreaDialog } from "@/components/events/delete-area-dialog";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Area } from "@/lib/types";

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

interface SortableAreaCardProps {
  area: AreaWithStats;
  eventSlug: string;
  onEditClick: (e: React.MouseEvent, area: AreaWithStats) => void;
  onDeleteClick: (e: React.MouseEvent, area: AreaWithStats) => void;
  t: (key: string) => string;
}

function SortableAreaCard({
  area,
  eventSlug,
  onEditClick,
  onDeleteClick,
  t,
}: SortableAreaCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: area.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCardClick = () => {
    if (!isDragging) {
      window.location.href = `/events/${eventSlug}/areas/${area.id}`;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      className="hover:shadow-lg transition-shadow cursor-pointer h-full group relative"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing touch-none"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1">
              <CardTitle className="text-lg">{area.name}</CardTitle>
              <CardDescription>
                Líder: {area.lead?.name || "Sin asignar"}
              </CardDescription>
            </div>
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
              <DropdownMenuItem onClick={(e) => onEditClick(e, area)}>
                <Edit className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => onDeleteClick(e, area)}
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
  );
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
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<AreaWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [areas, setAreas] = useState(areasWithStats);
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync areas state when props change
  useEffect(() => {
    setAreas(areasWithStats);
  }, [areasWithStats]);

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

  const handleEditClick = async (e: React.MouseEvent, area: AreaWithStats) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Fetch full area data
    try {
      const response = await fetch(`/api/areas/${area.id}`);
      if (response.ok) {
        const fullArea = await response.json();
        setEditingArea(fullArea);
        setIsAreaModalOpen(true);
      } else {
        console.error("Failed to fetch area data");
      }
    } catch (error) {
      console.error("Error fetching area data:", error);
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsAreaModalOpen(open);
    if (!open) {
      setEditingArea(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = areas.findIndex((area) => area.id === active.id);
    const newIndex = areas.findIndex((area) => area.id === over.id);

    const newAreas = arrayMove(areas, oldIndex, newIndex);
    setAreas(newAreas);

    // Update order values based on new positions
    const areaOrders = newAreas.map((area, index) => ({
      id: area.id,
      order: index + 1,
    }));

    try {
      const response = await fetch("/api/areas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          areaOrders,
        }),
      });

      if (!response.ok) {
        // Revert on error
        setAreas(areas);
        console.error("Failed to reorder areas");
      } else {
        // Refresh to get updated data
        router.refresh();
      }
    } catch (error) {
      // Revert on error
      setAreas(areas);
      console.error("Error reordering areas:", error);
    }
  };

  const handleAreaCreated = () => {
    router.refresh();
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
          {t("projectDetail.addArea")}
        </Button>
      </div>

      {/* Areas Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={areas.map((area) => area.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <SortableAreaCard
                key={area.id}
                area={area}
                eventSlug={eventSlug}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                t={t}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <NewAreaModal
        open={isAreaModalOpen}
        onOpenChange={handleModalClose}
        area={editingArea || undefined}
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

