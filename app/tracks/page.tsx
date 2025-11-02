import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { getTracks, getTasksByTrackId, getUserById, getEventById } from "@/lib/data";

export default function TracksPage() {
  const tracks = getTracks();

  // Enrich tracks with details
  const tracksWithDetails = tracks.map((track) => {
    const lead = getUserById(track.leadId);
    const event = getEventById(track.eventId);
    const trackTasks = getTasksByTrackId(track.id);
    const completed = trackTasks.filter((t) => t.status === "completed").length;
    const participants = track.participantIds.map((id) => getUserById(id)).filter(Boolean);

    return {
      ...track,
      lead,
      event,
      tasks: trackTasks.length,
      completed,
      participants,
    };
  });

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tracks</h1>
          <p className="text-muted-foreground mt-2">
            Explora todos los tracks entre eventos
          </p>
        </div>

        {/* Tracks Grid */}
        {tracksWithDetails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No se encontraron tracks</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tracksWithDetails.map((track) => {
              const progress = track.tasks > 0
                ? Math.round((track.completed / track.tasks) * 100)
                : 0;

              return (
                <Link key={track.id} href={`/tracks/${track.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-xl">{track.name}</CardTitle>
                      <CardDescription>{track.event?.name || "Evento desconocido"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={track.lead?.avatar || ""} alt={track.lead?.name || ""} />
                            <AvatarFallback>{track.lead?.initials || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{track.lead?.name || "Sin asignar"}</p>
                            <p className="text-xs text-muted-foreground">Líder del Track</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {track.participants?.length || 0} Participantes
                          </span>
                          <span className="text-muted-foreground">
                            {track.completed}/{track.tasks} Tareas
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progreso</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
