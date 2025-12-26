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
import { Plus } from "lucide-react";
import { NewAreaModal } from "@/components/projects/new-area-modal";
import { DeleteAreaDialog } from "@/components/projects/delete-area-dialog";
import { AreaCard } from "@/components/projects/area-card";
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
  leadId?: string;
  taskCount: number;
  completed: number;
  progress: number;
  lead: {
    id: string;
    name: string;
    initials: string;
  } | null;
}

interface ProjectAreasClientProps {
  projectId: string;
  projectSlug: string;
  projectName: string;
  areasWithStats: AreaWithStats[];
  users: User[];
}

interface SortableAreaCardProps {
  area: AreaWithStats;
  projectSlug: string;
  onEditClick: (e: React.MouseEvent, area: AreaWithStats) => void;
  onDeleteClick: (e: React.MouseEvent, area: AreaWithStats) => void;
}

function SortableAreaCard({
  area,
  projectSlug,
  onEditClick,
  onDeleteClick,
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

  return (
    <AreaCard
      area={{
        id: area.id,
        name: area.name,
        taskCount: area.taskCount,
        completed: area.completed,
        lead: area.lead,
      }}
      projectSlug={projectSlug}
      onEditClick={(e) => onEditClick(e, area)}
      onDeleteClick={(e) => onDeleteClick(e, area)}
      isDragging={isDragging}
      dragHandleProps={{ 
        attributes: { ...attributes } as Record<string, unknown>, 
        listeners: { ...(listeners || {}) } as Record<string, unknown> 
      }}
      cardRef={setNodeRef}
      cardStyle={style}
    />
  );
}

export function ProjectAreasClient({
  projectId,
  projectSlug,
  projectName,
  areasWithStats,
  users,
}: ProjectAreasClientProps) {
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
          projectId,
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
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Areas - {projectName}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Gestiona todas las áreas de este proyecto
          </p>
        </div>
        <Button onClick={() => setIsAreaModalOpen(true)} className="w-full sm:w-auto">
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <SortableAreaCard
                key={area.id}
                area={area}
                projectSlug={projectSlug}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <NewAreaModal
        open={isAreaModalOpen}
        onOpenChange={handleModalClose}
        area={editingArea || undefined}
        projectId={projectId}
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

