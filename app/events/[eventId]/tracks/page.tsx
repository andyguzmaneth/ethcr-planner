import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getEventById, getTracksByEventId, getTasksByEventId, getUserById } from "@/lib/data";

interface EventTracksPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventTracksPage({ params }: EventTracksPageProps) {
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

  // Calculate stats for each track
  const tracksWithStats = tracks.map((track) => {
    const trackTasks = allTasks.filter((t) => t.trackId === track.id);
    const completed = trackTasks.filter((t) => t.status === "completed").length;
    const progress = trackTasks.length > 0 ? Math.round((completed / trackTasks.length) * 100) : 0;
    const lead = getUserById(track.leadId);

    return {
      ...track,
      taskCount: trackTasks.length,
      completed,
      progress,
      lead,
    };
  });

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tracks - {event.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona todos los tracks de este evento
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Track
          </Button>
        </div>

        {/* Tracks Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tracksWithStats.map((track) => (
            <Card key={track.id} className="hover:shadow-lg transition-shadow">
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progreso</span>
                      <span>{track.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${track.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
