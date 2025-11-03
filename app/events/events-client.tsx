"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Check } from "lucide-react";
import Link from "next/link";
import { NewEventModal } from "@/components/events/new-event-modal";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { Event } from "@/lib/types";

interface EventsClientProps {
  events: Array<
    Event & {
      areaCount: number;
      taskCount: number;
      completedTasks: number;
      isJoined: boolean;
    }
  >;
}

export function EventsClient({ events }: EventsClientProps) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joiningEvents, setJoiningEvents] = useState<Set<string>>(new Set());
  const [joinedStates, setJoinedStates] = useState<Set<string>>(
    new Set(events.filter((e) => e.isJoined).map((e) => e.id))
  );
  const router = useRouter();

  const handleContinue = (template: "meetup" | "eth-pura-vida") => {
    // ROAquí se implementará la lógica para crear el evento con la plantilla seleccionada
    console.log("Crear evento con plantilla:", template);
    // TODO: Implementar creación de evento
  };

  const handleJoinEvent = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (joiningEvents.has(eventId)) return;

    setJoiningEvents((prev) => new Set(prev).add(eventId));

    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
      });

      if (response.ok) {
        setJoinedStates((prev) => new Set(prev).add(eventId));
        router.refresh(); // Refresh to update sidebar
      }
    } catch (error) {
      console.error("Error joining event:", error);
    } finally {
      setJoiningEvents((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  };

  const handleLeaveEvent = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (joiningEvents.has(eventId)) return;

    setJoiningEvents((prev) => new Set(prev).add(eventId));

    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "DELETE",
      });

      if (response.ok) {
        setJoinedStates((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        router.refresh(); // Refresh to update sidebar
      }
    } catch (error) {
      console.error("Error leaving event:", error);
    } finally {
      setJoiningEvents((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("events.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("events.description")}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("events.newEvent")}
        </Button>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">{t("events.noEvents")}</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("events.createFirstEvent")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const progress = event.taskCount > 0
              ? Math.round((event.completedTasks / event.taskCount) * 100)
              : 0;

            const isJoined = joinedStates.has(event.id);
            const isLoading = joiningEvents.has(event.id);

            return (
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow relative"
              >
                <Link href={`/events/${event.slug}`} className="block">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 pr-2">
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
                        <span className="text-muted-foreground">{event.areaCount} {t("events.areas")}</span>
                        <span className="text-muted-foreground">
                          {event.completedTasks}/{event.taskCount} {t("events.tasks")}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("events.progress")}</span>
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
                </Link>
                {/* Join/Leave Button - positioned absolutely to not interfere with card click */}
                <div className="absolute top-4 right-4">
                  {isJoined ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => handleLeaveEvent(event.id, e)}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin">⟳</span>
                          {t("events.leaving")}
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          {t("events.joined")}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleJoinEvent(event.id, e)}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin">⟳</span>
                          {t("events.joining")}
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          {t("events.join")}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
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


