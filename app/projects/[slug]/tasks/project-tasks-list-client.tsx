"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { NewTaskModal } from "@/components/events/new-task-modal";
import { DeleteTaskDialog } from "@/components/events/delete-task-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Task } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface TaskWithDetails extends Task {
  assignee?: {
    id: string;
    name: string;
    initials?: string;
  } | null;
  area?: {
    id: string;
    name: string;
  } | null;
  event?: {
    id: string;
    name: string;
  } | null;
}

interface EventTasksListClientProps {
  tasks: TaskWithDetails[];
  eventId: string;
  eventName: string;
  areas: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string; initials: string; email?: string }>;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}

export function EventTasksListClient({
  tasks,
  eventId,
  eventName,
  areas,
  users,
  statusColors,
  statusLabels,
}: EventTasksListClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTaskCreated = () => {
    router.refresh();
  };

  const handleTaskClick = (task: TaskWithDetails) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingTask(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, task: TaskWithDetails) => {
    e.stopPropagation();
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
        router.refresh();
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, task: TaskWithDetails) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No se encontraron tareas</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("projectDetail.createFirstTask")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full ${statusColors[task.status as keyof typeof statusColors]}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{task.title}</h3>
                          {task.area && (
                            <Badge variant="outline" className="text-xs">
                              {task.area.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{task.assignee?.name || "Sin asignar"}</span>
                          <span>•</span>
                          <span>{eventName}</span>
                          {task.deadline && (
                            <>
                              <span>•</span>
                              <span>Vence: {new Date(task.deadline).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {statusLabels[task.status as keyof typeof statusLabels]}
                      </Badge>
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
                          <DropdownMenuItem onClick={(e) => handleEditClick(e, task)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => handleDeleteClick(e, task)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <NewTaskModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        task={editingTask || undefined}
        eventId={eventId}
        eventName={eventName}
        areas={areas}
        users={users}
        onSuccess={handleTaskCreated}
      />
      {taskToDelete && (
        <DeleteTaskDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          taskTitle={taskToDelete.title}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}

