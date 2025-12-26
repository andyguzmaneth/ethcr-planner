"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, List, LayoutGrid, Calendar as CalendarIcon, MoreVertical, Edit, Trash2, Table as TableIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NewTaskModal } from "@/components/projects/new-task-modal";
import { DeleteTaskDialog } from "@/components/projects/delete-task-dialog";
import { useRouter } from "next/navigation";
import { Task } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  project?: {
    id: string;
    name: string;
  } | null;
}

interface TasksViewClientProps {
  tasks: TaskWithDetails[];
  projects: Array<{ id: string; name: string }>;
  areas: Array<{ id: string; name: string; projectId?: string }>;
  users: Array<{ id: string; name: string; initials: string; email?: string }>;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}

export function TasksViewClient({
  tasks,
  projects,
  areas,
  users,
  statusColors,
  statusLabels,
}: TasksViewClientProps) {
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

  // Group tasks by status for Kanban view
  const tasksByStatus = {
    pending: tasks.filter((t) => t.status === "pending"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    blocked: tasks.filter((t) => t.status === "blocked"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  // Group tasks by deadline for Calendar view
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.deadline) {
      const key = "no-deadline";
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }
    const date = new Date(task.deadline).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, TaskWithDetails[]>);

  const sortedDates = Object.keys(tasksByDate)
    .filter((date) => date !== "no-deadline")
    .sort();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* View Toggle */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list" className="text-xs sm:text-sm">
            <List className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Lista</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="text-xs sm:text-sm">
            <LayoutGrid className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs sm:text-sm">
            <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Calendario</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="text-xs sm:text-sm">
            <TableIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Tabla</span>
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
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
                        <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                          <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 sm:mt-0 ${statusColors[task.status as keyof typeof statusColors]}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium break-words">{task.title}</h3>
                              {task.area && (
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {task.area.name}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                              <span className="break-words">{task.assignee?.name || "Sin asignar"}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="break-words">{task.project?.name || "Proyecto desconocido"}</span>
                              {task.deadline && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="break-words">Vence: {new Date(task.deadline).toLocaleDateString()}</span>
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
        </TabsContent>

        {/* Kanban View */}
        <TabsContent value="kanban" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(statusLabels).map(([status, label]) => {
              const statusTasks = tasksByStatus[status as keyof typeof tasksByStatus];
              return (
                <Card key={status}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{label}</h3>
                        <Badge variant="secondary">{statusTasks.length}</Badge>
                      </div>
                      <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {statusTasks.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            No hay tareas
                          </div>
                        ) : (
                          statusTasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => handleTaskClick(task)}
                              className="p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors cursor-pointer group relative"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreVertical className="h-3 w-3" />
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
                                {task.assignee && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{task.assignee.name}</span>
                                  </div>
                                )}
                                {task.deadline && (
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(task.deadline).toLocaleDateString()}
                                  </div>
                                )}
                                {task.area && (
                                  <Badge variant="outline" className="text-xs w-fit">
                                    {task.area.name}
                                  </Badge>
                                )}
                                {task.project && (
                                  <div className="text-xs text-muted-foreground">
                                    {task.project.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No se encontraron tareas</p>
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("projectDetail.createFirstTask")}
                    </Button>
                  </div>
                ) : (
                  <>
                    {sortedDates.length > 0 && (
                      <div className="space-y-4">
                        {sortedDates.map((date) => {
                          const dateTasks = tasksByDate[date];
                          return (
                            <div key={date} className="space-y-2">
                              <h3 className="font-semibold text-lg">
                                {new Date(date).toLocaleDateString("es-ES", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </h3>
                              <div className="space-y-2 pl-4">
                                {dateTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    onClick={() => handleTaskClick(task)}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <div
                                        className={`w-2 h-2 rounded-full ${statusColors[task.status as keyof typeof statusColors]}`}
                                      />
                                      <div className="flex-1">
                                        <h4 className="font-medium">{task.title}</h4>
                                        {task.assignee && (
                                          <p className="text-sm text-muted-foreground">
                                            {task.assignee.name}
                                          </p>
                                        )}
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
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {tasksByDate["no-deadline"] && tasksByDate["no-deadline"].length > 0 && (
                      <div className="space-y-2 pt-4 border-t">
                        <h3 className="font-semibold text-lg">Sin fecha límite</h3>
                        <div className="space-y-2 pl-4">
                          {tasksByDate["no-deadline"].map((task) => (
                            <div
                              key={task.id}
                              onClick={() => handleTaskClick(task)}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${statusColors[task.status as keyof typeof statusColors]}`}
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium">{task.title}</h4>
                                  {task.assignee && (
                                    <p className="text-sm text-muted-foreground">
                                      {task.assignee.name}
                                    </p>
                                  )}
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
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No se encontraron tareas</p>
                  <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("projectDetail.createFirstTask")}
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Estado</TableHead>
                          <TableHead className="min-w-[200px]">Tarea</TableHead>
                          <TableHead className="min-w-[120px]">Área</TableHead>
                          <TableHead className="min-w-[150px]">Proyecto</TableHead>
                          <TableHead className="min-w-[120px]">Asignado a</TableHead>
                          <TableHead className="min-w-[120px]">Fecha límite</TableHead>
                          <TableHead className="min-w-[80px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${statusColors[task.status as keyof typeof statusColors]}`}
                            />
                            <Badge variant="secondary">
                              {statusLabels[task.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          {task.area ? (
                            <Badge variant="outline" className="text-xs">
                              {task.area.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {task.project?.name || "Proyecto desconocido"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {task.assignee?.name || "Sin asignar"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {task.deadline ? (
                            <span className="text-sm">
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-8 w-8"
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
                        </TableCell>
                      </TableRow>
                    ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewTaskModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        task={editingTask || undefined}
        projects={projects}
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
    </div>
  );
}

