"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";
import { NewEventModal } from "@/components/events/new-event-modal";
import type { Event } from "@/lib/types";

interface EventsClientProps {
  events: Array<
    Event & {
      trackCount: number;
      taskCount: number;
      completedTasks: number;
    }
  >;
}

export function EventsClient({ events }: EventsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContinue = (template: "meetup" | "eth-pura-vida") => {
    // Aquí se implementará la lógica para crear el evento con la plantilla seleccionada
    console.log("Crear evento con plantilla:", template);
    // TODO: Implementar creación de evento
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todos tus eventos de Ethereum Costa Rica
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Aún no hay eventos</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crea tu primer evento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const progress = event.taskCount > 0
              ? Math.round((event.completedTasks / event.taskCount) * 100)
              : 0;

            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{event.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="secondary" className="mr-2">
                            {event.type}
                          </Badge>
                          {event.status}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{event.trackCount} Tracks</span>
                        <span className="text-muted-foreground">
                          {event.completedTasks}/{event.taskCount} Tareas
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

      <NewEventModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onContinue={handleContinue}
      />
    </>
  );
}


