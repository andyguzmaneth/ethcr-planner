"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewTaskModal } from "@/components/events/new-task-modal";
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

interface TasksListClientProps {
  tasks: TaskWithDetails[];
  events: Array<{ id: string; name: string }>;
  areas: Array<{ id: string; name: string; eventId: string }>;
  users: Array<{ id: string; name: string; initials: string; email?: string }>;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}

export function TasksListClient({
  tasks,
  events,
  areas,
  users,
  statusColors,
  statusLabels,
}: TasksListClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
                  {t("eventDetail.createFirstTask")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
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
                          <span>{task.event?.name || "Evento desconocido"}</span>
                          {task.deadline && (
                            <>
                              <span>•</span>
                              <span>Vence: {new Date(task.deadline).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {statusLabels[task.status as keyof typeof statusLabels]}
                    </Badge>
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
        events={events}
        areas={areas}
        users={users}
        onSuccess={handleTaskCreated}
      />
    </>
  );
}

