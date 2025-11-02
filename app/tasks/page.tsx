import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, LayoutGrid, Calendar as CalendarIcon } from "lucide-react";
import { getTasks, getUserById, getEventById, getTrackById } from "@/lib/data";

export default function TasksPage() {
  const tasks = getTasks();

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

  // Enrich tasks with details
  const tasksWithDetails = tasks.map((task) => {
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
    const event = getEventById(task.eventId);
    const track = getTrackById(task.trackId);

    return {
      ...task,
      assignee,
      event,
      track,
    };
  });

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona y rastrea todas las tareas entre eventos
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>

        {/* View Toggle and Filters */}
        <div className="flex items-center justify-between">
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
          </Tabs>
        </div>

        {/* Tasks List View */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {tasksWithDetails.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No se encontraron tareas</p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crea tu primera tarea
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasksWithDetails.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full ${statusColors[task.status as keyof typeof statusColors]}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{task.title}</h3>
                            {task.track && (
                              <Badge variant="outline" className="text-xs">
                                {task.track.name}
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
                                <span>Vence: {task.deadline}</span>
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
      </div>
    </MainLayout>
  );
}
