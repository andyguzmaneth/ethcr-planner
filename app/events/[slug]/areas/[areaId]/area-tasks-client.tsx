"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, List, LayoutGrid, Calendar as CalendarIcon } from "lucide-react";

interface TaskWithDetails {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  deadline?: string;
  status: "pending" | "in_progress" | "blocked" | "completed";
  assignee: {
    id: string;
    name: string;
    initials?: string;
  } | null;
}

interface AreaTasksClientProps {
  eventName: string;
  areaName: string;
  tasks: TaskWithDetails[];
}

export function AreaTasksClient({
  eventName,
  areaName,
  tasks,
}: AreaTasksClientProps) {
  const statusColors = {
    pending: "bg-gray-500",
    in_progress: "bg-blue-500",
    blocked: "bg-red-500",
    completed: "bg-green-500",
  };

  const statusLabels = {
    pending: "Pendiente",
    in_progress: "En Progreso",
    blocked: "Bloqueada",
    completed: "Completada",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tareas</h2>
          <p className="text-muted-foreground mt-1">
            Tareas filtradas para {areaName} en {eventName}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* View Toggle */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">
            <List className="mr-2 h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendario
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
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Crea tu primera tarea
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-3 h-3 rounded-full ${statusColors[task.status]}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{task.title}</h3>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{task.assignee?.name || "Sin asignar"}</span>
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
                          {statusLabels[task.status]}
                        </Badge>
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
                              className="p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors cursor-pointer"
                            >
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">{task.title}</h4>
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
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Crea tu primera tarea
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
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <div
                                        className={`w-2 h-2 rounded-full ${statusColors[task.status]}`}
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
                                    <Badge variant="secondary">
                                      {statusLabels[task.status]}
                                    </Badge>
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
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${statusColors[task.status]}`}
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
                              <Badge variant="secondary">
                                {statusLabels[task.status]}
                              </Badge>
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
      </Tabs>
    </div>
  );
}

