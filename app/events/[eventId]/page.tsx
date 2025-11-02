import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings } from "lucide-react";
import { getEventById, getTracksByEventId, getTasksByEventId, getUserById } from "@/lib/data";

interface EventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;

  const event = getEventById(eventId);
  if (!event) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>Evento no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const tracks = getTracksByEventId(eventId);
  const allTasks = getTasksByEventId(eventId);

  // Calculate stats for tracks
  const tracksWithStats = tracks.map((track) => {
    const trackTasks = allTasks.filter((t) => t.trackId === track.id);
    const completed = trackTasks.filter((t) => t.status === "completed").length;
    return {
      ...track,
      taskCount: trackTasks.length,
      completed,
      lead: getUserById(track.leadId),
    };
  });

  const totalTasks = allTasks.length;
  const totalCompleted = allTasks.filter((t) => t.status === "completed").length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Event Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
              <Badge variant="secondary">{event.type}</Badge>
              <Badge>{event.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              Panel de planificación y gestión de eventos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Editar Evento
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="meetings">Reuniones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tracks.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Completación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionPercentage}%</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tracks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tracks</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Track
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tracksWithStats.map((track) => {
                const progress = track.taskCount > 0
                  ? Math.round((track.completed / track.taskCount) * 100)
                  : 0;

                return (
                  <Card key={track.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{track.name}</CardTitle>
                      <CardDescription>
                        Líder: {track.lead?.name || "Sin asignar"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {track.completed}/{track.taskCount} Tareas
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Tareas</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Tarea
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  La vista de lista de tareas se implementará aquí
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Reuniones</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Programar Reunión
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  La lista de reuniones se implementará aquí
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
