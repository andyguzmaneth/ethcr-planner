"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { NewTrackModal } from "@/components/events/new-track-modal";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  initials: string;
  email?: string;
}

interface TrackWithStats {
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

interface EventTracksClientProps {
  eventId: string;
  eventName: string;
  tracksWithStats: TrackWithStats[];
  users: User[];
}

export function EventTracksClient({
  eventId,
  eventName,
  tracksWithStats,
  users,
}: EventTracksClientProps) {
  const router = useRouter();
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const handleTrackCreated = () => {
    router.refresh();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tracks - {eventName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todos los tracks de este evento
          </p>
        </div>
        <Button onClick={() => setIsTrackModalOpen(true)}>
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

      <NewTrackModal
        open={isTrackModalOpen}
        onOpenChange={setIsTrackModalOpen}
        eventId={eventId}
        users={users}
        onSuccess={handleTrackCreated}
      />
    </div>
  );
}

