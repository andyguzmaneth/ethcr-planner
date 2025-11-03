"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { NewAreaModal } from "@/components/events/new-area-modal";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface User {
  id: string;
  name: string;
  initials: string;
  email?: string;
}

interface AreaWithStats {
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

interface EventAreasClientProps {
  eventId: string;
  eventSlug: string;
  eventName: string;
  areasWithStats: AreaWithStats[];
  users: User[];
}

export function EventAreasClient({
  eventId,
  eventSlug,
  eventName,
  areasWithStats,
  users,
}: EventAreasClientProps) {
  const router = useRouter();
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleAreaCreated = () => {
    router.refresh();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Areas - {eventName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todas las áreas de este evento
          </p>
        </div>
        <Button onClick={() => setIsAreaModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("eventDetail.addArea")}
        </Button>
      </div>

      {/* Areas Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {areasWithStats.map((area) => (
          <Link key={area.id} href={`/events/${eventSlug}/areas/${area.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg">{area.name}</CardTitle>
                <CardDescription>
                  Líder: {area.lead?.name || "Sin asignar"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {area.completed}/{area.taskCount} Tareas
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progreso</span>
                      <span>{area.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${area.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <NewAreaModal
        open={isAreaModalOpen}
        onOpenChange={setIsAreaModalOpen}
        eventId={eventId}
        users={users}
        onSuccess={handleAreaCreated}
      />
    </div>
  );
}

